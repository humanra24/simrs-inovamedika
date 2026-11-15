<?php

namespace api\modules\v1\controllers;

use Yii;
use yii\rest\Controller;
use yii\filters\Cors;
use common\components\JwtAuth;
use common\components\RoleFilter;
use common\models\Visit;
use common\models\Medicine;
use common\models\Prescription;
use common\models\PrescriptionItem;

class PrescriptionController extends Controller
{
    public function behaviors()
    {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = ['class' => JwtAuth::class];

        // Dokter (buat resep), Farmasi (proses), Admin (semua)
        $behaviors['roleFilter'] = [
            'class' => RoleFilter::class,
            'roles' => ['Dokter', 'Petugas Farmasi', 'Administrator'],
        ];

        $behaviors['corsFilter'] = ['class' => Cors::class];
        unset($behaviors['contentNegotiator']['formats']['text/html']);
        return $behaviors;
    }

    /**
     * POST /api/v1/prescriptions/<visit_id>
     * Dokter membuat resep baru
     * Body: { "items": [ { "medicine_id": 1, "quantity": 10, "dosage": "3x1", "frequency": "Setelah makan" } ] }
     */
    public function actionCreate($visit_id)
    {
        $visit = Visit::findOne($visit_id);
        if (!$visit) {
            throw new \yii\web\NotFoundHttpException("Data kunjungan tidak ditemukan.");
        }

        // Cek apakah sudah ada resep
        if (Prescription::find()->where(['visit_id' => $visit_id])->exists()) {
            Yii::$app->response->statusCode = 422;
            return ['status' => 'error', 'message' => 'Resep untuk kunjungan ini sudah ada.'];
        }

        $items = Yii::$app->request->post('items');
        if (empty($items) || !is_array($items)) {
            Yii::$app->response->statusCode = 422;
            return ['status' => 'error', 'message' => 'Minimal 1 item obat harus diisi.'];
        }

        // Validasi stok & data obat terlebih dahulu
        $medicineData = [];
        foreach ($items as $item) {
            $medicine = Medicine::findOne($item['medicine_id'] ?? 0);
            if (!$medicine) {
                Yii::$app->response->statusCode = 422;
                return ['status' => 'error', 'message' => "Obat dengan ID {$item['medicine_id']} tidak ditemukan."];
            }
            if ($medicine->stock < $item['quantity']) {
                Yii::$app->response->statusCode = 422;
                return ['status' => 'error', 'message' => "Stok obat '{$medicine->name}' tidak mencukupi. Sisa: {$medicine->stock}"];
            }
            $medicineData[] = ['model' => $medicine, 'item' => $item];
        }

        // Simpan dalam transaksi database
        $transaction = Yii::$app->db->beginTransaction();
        try {
            $prescription = new Prescription();
            $prescription->visit_id = $visit_id;
            $prescription->status = 'pending';
            $prescription->save(false);

            foreach ($medicineData as $data) {
                $itemModel = new PrescriptionItem();
                $itemModel->prescription_id = $prescription->id;
                $itemModel->medicine_id = $data['model']->id;
                $itemModel->quantity = $data['item']['quantity'];
                $itemModel->dosage = $data['item']['dosage'] ?? null;
                $itemModel->frequency = $data['item']['frequency'] ?? null;
                $itemModel->price = $data['model']->price; // Snapshot harga
                $itemModel->save(false);
            }

            $transaction->commit();
            Yii::$app->response->statusCode = 201;
            return [
                'status' => 'success',
                'message' => 'Resep berhasil dibuat',
                'data' => Prescription::find()->with(['items.medicine'])->where(['id' => $prescription->id])->one()
            ];
        } catch (\Exception $e) {
            $transaction->rollBack();
            Yii::$app->response->statusCode = 500;
            return ['status' => 'error', 'message' => 'Gagal membuat resep: ' . $e->getMessage()];
        }
    }

    /**
     * GET /api/v1/prescriptions/pending
     * Petugas farmasi melihat daftar resep yang menunggu
     */
    public function actionPending()
    {
        $prescriptions = Prescription::find()
            ->with(['visit.patient', 'items.medicine'])
            ->where(['status' => 'pending'])
            ->orderBy(['created_at' => SORT_ASC])
            ->all();

        return ['status' => 'success', 'total' => count($prescriptions), 'data' => $prescriptions];
    }

    /**
     * POST /api/v1/prescriptions/<id>/dispense
     * Petugas farmasi memproses penyerahan obat (stok berkurang)
     */
    public function actionDispense($id)
    {
        $prescription = Prescription::find()->with(['items'])->where(['id' => $id])->one();
        if (!$prescription) {
            throw new \yii\web\NotFoundHttpException("Resep tidak ditemukan.");
        }
        if ($prescription->status !== 'pending') {
            Yii::$app->response->statusCode = 422;
            return ['status' => 'error', 'message' => 'Resep ini sudah diproses sebelumnya.'];
        }

        $transaction = Yii::$app->db->beginTransaction();
        try {
            foreach ($prescription->items as $item) {
                // Lock row obat untuk mencegah race condition (Skenario 2)
                $medicine = Medicine::find()->where(['id' => $item->medicine_id])->one();

                // Gunakan optimistic locking dengan UPDATE atomic
                $updated = Medicine::updateAllCounters(
                    ['stock' => -$item->quantity],
                    ['and', ['id' => $item->medicine_id], ['>=', 'stock', $item->quantity]]
                );

                if ($updated === 0) {
                    throw new \Exception("Stok obat '{$medicine->name}' tidak mencukupi untuk diproses.");
                }
            }

            $prescription->status = 'dispensed';
            $prescription->save(false);

            $transaction->commit();
            return ['status' => 'success', 'message' => 'Obat berhasil diserahkan dan stok telah dikurangi'];
        } catch (\Exception $e) {
            $transaction->rollBack();
            Yii::$app->response->statusCode = 422;
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    /**
     * DELETE /api/v1/prescriptions/<id>
     * Membatalkan/menghapus resep (hanya jika status masih 'pending')
     */
    public function actionDelete($id)
    {
        $prescription = Prescription::find()->with(['items'])->where(['id' => $id])->one();

        if (!$prescription) {
            throw new \yii\web\NotFoundHttpException("Resep tidak ditemukan.");
        }

        // Pencegahan: Jangan hapus resep yang sudah diproses
        if ($prescription->status !== 'pending') {
            Yii::$app->response->statusCode = 422;
            return [
                'status' => 'error',
                'message' => 'Resep yang sudah diproses (diserahkan obatnya) tidak dapat dibatalkan.'
            ];
        }

        $transaction = Yii::$app->db->beginTransaction();
        try {
            // Hapus semua item terlebih dahulu (jika cascade belum aktif)
            PrescriptionItem::deleteAll(['prescription_id' => $prescription->id]);

            // Hapus header resep
            $prescription->delete();

            $transaction->commit();
            return ['status' => 'success', 'message' => 'Resep berhasil dibatalkan.'];
        } catch (\Exception $e) {
            $transaction->rollBack();
            Yii::$app->response->statusCode = 500;
            return ['status' => 'error', 'message' => 'Gagal membatalkan resep: ' . $e->getMessage()];
        }
    }
}
