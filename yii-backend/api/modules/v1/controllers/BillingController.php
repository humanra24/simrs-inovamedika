<?php

namespace api\modules\v1\controllers;

use Yii;
use yii\rest\Controller;
use yii\filters\Cors;
use common\components\JwtAuth;
use common\components\RoleFilter;
use common\models\Visit;
use common\models\Bill;
use common\models\BillItem;
use common\models\MedicalRecord;
use common\models\Payment;
use common\models\Prescription;

class BillingController extends Controller
{
    const REGISTRATION_FEE = 10000; // Biaya pendaftaran flat

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = ['class' => JwtAuth::class];

        // Kasir, Admin, dan Dokter (untuk melihat tagihan)
        $behaviors['roleFilter'] = [
            'class' => RoleFilter::class,
            'roles' => ['Kasir', 'Administrator', 'Dokter'],
        ];

        $behaviors['corsFilter'] = ['class' => Cors::class];
        unset($behaviors['contentNegotiator']['formats']['text/html']);
        return $behaviors;
    }

    /**
     * POST /api/v1/bills/generate/<visit_id>
     * Menghasilkan tagihan otomatis dari semua pelayanan
     */
    public function actionGenerate($visit_id)
    {
        $visit = Visit::findOne($visit_id);
        if (!$visit) {
            throw new \yii\web\NotFoundHttpException("Data kunjungan tidak ditemukan.");
        }

        if (!MedicalRecord::find()->where(['visit_id' => $visit_id])->exists()) {
            Yii::$app->response->statusCode = 422;
            return [
                'status' => 'error',
                'message' => 'Rekam medis belum diisi. Lengkapi pemeriksaan dokter sebelum membuat tagihan.',
            ];
        }

        $pendingLab = $visit->getLabOrders()->where(['status' => 'pending'])->exists();
        if ($pendingLab) {
            Yii::$app->response->statusCode = 422;
            return [
                'status' => 'error',
                'message' => 'Masih ada permintaan lab yang belum selesai. Selesaikan atau batalkan dulu sebelum membuat tagihan.',
            ];
        }

        $pendingPrescription = Prescription::find()
            ->where(['visit_id' => $visit_id, 'status' => 'pending'])
            ->exists();

        if ($pendingPrescription) {
            Yii::$app->response->statusCode = 422;
            return [
                'status' => 'error',
                'message' => 'Resep belum diserahkan oleh farmasi. Proses atau batalkan resep sebelum membuat tagihan.',
            ];
        }

        // Cek jika tagihan sudah ada
        $existingBill = Bill::findOne(['visit_id' => $visit_id]);
        if ($existingBill) {
            Yii::$app->response->statusCode = 422;
            return ['status' => 'error', 'message' => 'Tagihan untuk kunjungan ini sudah dibuat.', 'data' => $existingBill];
        }

        $transaction = Yii::$app->db->beginTransaction();
        try {
            $bill = new Bill();
            $bill->visit_id = $visit_id;
            $bill->status = 'unpaid';
            $bill->save(false);

            $total = 0;

            // 1. Biaya Pendaftaran
            $item = new BillItem();
            $item->bill_id = $bill->id;
            $item->item_type = 'registration';
            $item->description = 'Biaya Pendaftaran';
            $item->amount = self::REGISTRATION_FEE;
            $item->save(false);
            $total += self::REGISTRATION_FEE;

            // 2. Biaya Tindakan Medis
            foreach ($visit->visitActions as $action) {
                $item = new BillItem();
                $item->bill_id = $bill->id;
                $item->item_type = 'action';
                $item->reference_id = $action->id;
                $item->description = 'Tindakan: ' . $action->medicalAction->name;
                $item->amount = $action->price;
                $item->save(false);
                $total += $action->price;
            }

            // 3. Biaya Obat
            if ($visit->prescription) {
                foreach ($visit->prescription->items as $prescItem) {
                    $item = new BillItem();
                    $item->bill_id = $bill->id;
                    $item->item_type = 'medicine';
                    $item->reference_id = $prescItem->id;
                    $item->description = 'Obat: ' . $prescItem->medicine->name . ' (x' . $prescItem->quantity . ')';
                    $item->amount = $prescItem->price * $prescItem->quantity;
                    $item->save(false);
                    $total += $prescItem->price * $prescItem->quantity;
                }
            }

            // 4. Biaya Lab (Simulasi: 50.000 per test completed)
            foreach ($visit->labOrders as $lab) {
                if ($lab->status === 'completed') {
                    $item = new BillItem();
                    $item->bill_id = $bill->id;
                    $item->item_type = 'lab';
                    $item->reference_id = $lab->id;
                    $item->description = 'Lab: ' . $lab->test_name;
                    $item->amount = 50000;
                    $item->save(false);
                    $total += 50000;
                }
            }

            $bill->total_amount = $total;
            $bill->save(false);

            $transaction->commit();
            Yii::$app->response->statusCode = 201;
            return [
                'status' => 'success',
                'message' => 'Tagihan berhasil dibuat',
                'data' => Bill::find()->with(['items'])->where(['id' => $bill->id])->asArray()->one()
            ];
        } catch (\Exception $e) {
            $transaction->rollBack();
            Yii::$app->response->statusCode = 500;
            return ['status' => 'error', 'message' => 'Gagal membuat tagihan: ' . $e->getMessage()];
        }
    }

    public function actionIndex()
    {
        $bills = Bill::find()
            ->with(['visit.patient', 'visit.polyclinic'])
            ->orderBy(['id' => SORT_DESC])
            ->asArray()
            ->all();

        // Tambahkan perhitungan sisa tagihan
        foreach ($bills as &$bill) {
            $bill['remaining_amount'] = $bill['total_amount'] - $bill['paid_amount'];
        }

        return ['status' => 'success', 'data' => $bills];
    }

    /**
     * GET /api/v1/bills/<visit_id>
     * Menampilkan detail tagihan
     */
    public function actionView($visit_id)
    {
        $bill = Bill::find()
            ->with(['items', 'payments', 'visit.patient'])
            ->where(['visit_id' => $visit_id])
            ->asArray()
            ->one();

        if ($bill) {
            // Tambahkan perhitungan sisa tagihan
            $bill['remaining_amount'] = $bill['total_amount'] - $bill['paid_amount'];
            return ['status' => 'success', 'data' => $bill];
        }
        throw new \yii\web\NotFoundHttpException("Tagihan tidak ditemukan.");
    }

    /**
     * POST /api/v1/bills/<bill_id>/pay
     * Mencatat pembayaran (dengan Idempotency Key - Skenario 3)
     */
    public function actionPay($bill_id)
    {
        $request = Yii::$app->request;
        $amount = $request->post('amount');
        $method = $request->post('payment_method', 'cash');
        $idempotencyKey = $request->post('idempotency_key');

        if (!$amount || !$idempotencyKey) {
            Yii::$app->response->statusCode = 422;
            return ['status' => 'error', 'message' => 'Amount dan idempotency_key wajib diisi.'];
        }

        // Cek apakah idempotency key sudah pernah dipakai (Skenario 3)
        $existingPayment = Payment::findOne(['idempotency_key' => $idempotencyKey]);
        if ($existingPayment) {
            // Kembalikan response yang sama persis (idempotent)
            return [
                'status' => 'success',
                'message' => 'Pembayaran sudah tercatat sebelumnya (idempotent).',
                'data' => $existingPayment
            ];
        }

        $bill = Bill::findOne($bill_id);
        if (!$bill) {
            throw new \yii\web\NotFoundHttpException("Tagihan tidak ditemukan.");
        }

        if ($bill->status === 'paid') {
            Yii::$app->response->statusCode = 422;
            return ['status' => 'error', 'message' => 'Tagihan ini sudah lunas.'];
        }

        $remaining = $bill->total_amount - $bill->paid_amount;
        if ($amount > $remaining) {
            Yii::$app->response->statusCode = 422;
            return ['status' => 'error', 'message' => 'Jumlah pembayaran melebihi sisa tagihan (Sisa: ' . $remaining . ')'];
        }

        $transaction = Yii::$app->db->beginTransaction();
        try {
            // Catat pembayaran
            $payment = new Payment();
            $payment->bill_id = $bill_id;
            $payment->amount = $amount;
            $payment->payment_method = $method;
            $payment->idempotency_key = $idempotencyKey;
            $payment->save(false);

            // Update total dibayar dan status
            $bill->paid_amount += $amount;

            if ($bill->paid_amount >= $bill->total_amount) {
                $bill->status = 'paid';
            } else if ($bill->paid_amount > 0) {
                $bill->status = 'partial';
            }

            $bill->save(false);

            if ($bill->status === 'paid') {
                $visit = Visit::findOne($bill->visit_id);
                if ($visit && $visit->status !== 'completed') {
                    $visit->status = 'completed';
                    $visit->save(false);
                }
            }

            $transaction->commit();

            return [
                'status' => 'success',
                'message' => 'Pembayaran berhasil dicatat.',
                'data' => [
                    'payment' => $payment,
                    'bill' => $bill
                ]
            ];
        } catch (\yii\db\IntegrityException $e) {
            $transaction->rollBack();
            // Jika ada race condition pada idempotency key
            Yii::$app->response->statusCode = 409;
            return ['status' => 'error', 'message' => 'Pembayaran sedang diproses, silakan cek riwayat.'];
        } catch (\Exception $e) {
            $transaction->rollBack();
            Yii::$app->response->statusCode = 500;
            return ['status' => 'error', 'message' => 'Gagal memproses pembayaran: ' . $e->getMessage()];
        }
    }

    /**
     * GET /api/v1/bills/<visit_id>/invoice
     * Menghasilkan invoice PDF untuk dicetak
     */
    public function actionInvoice($visit_id)
    {
        $bill = Bill::find()
            ->with(['items', 'visit.patient'])
            ->where(['visit_id' => $visit_id])
            ->one();

        if (!$bill) {
            throw new \yii\web\NotFoundHttpException("Tagihan tidak ditemukan.");
        }

        // Render konten HTML dari view
        $content = $this->renderPartial('@api/views/billing/invoice.php', [
            'bill' => $bill,
        ]);

        // Gunakan mPDF langsung
        $mpdf = new \Mpdf\Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'margin_top' => 15,
            'margin_bottom' => 15,
            'margin_left' => 15,
            'margin_right' => 15,
        ]);

        $mpdf->WriteHTML($content);

        // TAMBAHKAN BARIS INI UNTUK CORS
        header('Access-Control-Allow-Origin: *');

        // Output langsung ke browser (inline)
        $mpdf->Output('Invoice-' . $bill->id . '.pdf', \Mpdf\Output\Destination::INLINE);
        exit;
    }
}
