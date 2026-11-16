<?php

namespace api\modules\v1\controllers;

use Yii;
use yii\rest\Controller;
use yii\filters\Cors;
use common\components\JwtAuth;
use common\components\RoleFilter;
use common\models\Bill;
use common\models\Visit;
use common\models\LabOrder;
use common\models\LabResult;

class LabController extends Controller
{
    private function isBilled($visit_id): bool
    {
        return Bill::find()->where(['visit_id' => $visit_id])->exists();
    }

    private function billedError()
    {
        Yii::$app->response->statusCode = 422;
        return [
            'status' => 'error',
            'message' => 'Tagihan untuk kunjungan ini sudah dibuat, transaksi lab tidak dapat diubah lagi.',
        ];
    }

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = ['class' => JwtAuth::class];

        // Dokter (buat order), Lab (input hasil), Admin (semua)
        $behaviors['roleFilter'] = [
            'class' => RoleFilter::class,
            'roles' => ['Dokter', 'Petugas Laboratorium', 'Administrator'],
        ];

        $behaviors['corsFilter'] = ['class' => Cors::class];
        unset($behaviors['contentNegotiator']['formats']['text/html']);
        return $behaviors;
    }

    /**
     * POST /api/v1/lab/orders/<visit_id>
     * Dokter membuat permintaan lab
     */
    public function actionCreateOrder($visit_id)
    {
        $visit = Visit::findOne($visit_id);
        if (!$visit) {
            throw new \yii\web\NotFoundHttpException("Data kunjungan tidak ditemukan.");
        }

        if ($this->isBilled($visit_id)) {
            return $this->billedError();
        }

        $test_name = Yii::$app->request->post('test_name');
        if (!$test_name) {
            Yii::$app->response->statusCode = 422;
            return ['status' => 'error', 'message' => 'Nama pemeriksaan lab wajib diisi.'];
        }

        $order = new LabOrder();
        $order->visit_id = $visit_id;
        $order->test_name = $test_name;
        $order->status = 'pending';

        if ($order->save()) {
            Yii::$app->response->statusCode = 201;
            return ['status' => 'success', 'message' => 'Permintaan lab berhasil dibuat', 'data' => $order];
        }

        Yii::$app->response->statusCode = 422;
        return ['status' => 'error', 'message' => 'Gagal membuat permintaan', 'errors' => $order->getErrors()];
    }

    /**
     * GET /api/v1/lab/orders/pending
     * Petugas lab melihat daftar permintaan
     */
    public function actionPendingOrders()
    {
        $orders = LabOrder::find()
            ->with(['visit.patient', 'visit.doctor'])
            ->where(['status' => 'pending'])
            ->orderBy(['created_at' => SORT_ASC])
            ->all();

        return ['status' => 'success', 'total' => count($orders), 'data' => $orders];
    }

    /**
     * POST /api/v1/lab/results/<lab_order_id>
     * Petugas lab menginput hasil
     */
    public function actionSubmitResult($lab_order_id)
    {
        $order = LabOrder::findOne($lab_order_id);
        if (!$order) {
            throw new \yii\web\NotFoundHttpException("Permintaan lab tidak ditemukan.");
        }

        if ($this->isBilled($order->visit_id)) {
            return $this->billedError();
        }

        if (LabResult::find()->where(['lab_order_id' => $lab_order_id])->exists()) {
            Yii::$app->response->statusCode = 422;
            return ['status' => 'error', 'message' => 'Hasil untuk permintaan ini sudah diinput.'];
        }

        $result = new LabResult();
        $result->lab_order_id = $lab_order_id;
        $result->result_data = Yii::$app->request->post('result_data');
        $result->notes = Yii::$app->request->post('notes');

        if ($result->save()) {
            $order->status = 'completed';
            $order->save();

            Yii::$app->response->statusCode = 201;
            return ['status' => 'success', 'message' => 'Hasil lab berhasil disimpan', 'data' => $result];
        }

        Yii::$app->response->statusCode = 422;
        return ['status' => 'error', 'message' => 'Validasi gagal', 'errors' => $result->getErrors()];
    }

    /**
     * GET /api/v1/lab/results/<visit_id>
     * Dokter melihat hasil lab berdasarkan riwayat kunjungan
     */
    public function actionViewResults($visit_id)
    {
        $orders = LabOrder::find()
            ->with(['result'])
            ->where(['visit_id' => $visit_id])
            ->all();

        return ['status' => 'success', 'total' => count($orders), 'data' => $orders];
    }

    /**
     * POST /api/v1/lab/orders/<lab_order_id>/cancel
     * Membatalkan permintaan lab (hanya jika status pending)
     */
    public function actionCancelOrder($lab_order_id)
    {
        $order = LabOrder::findOne($lab_order_id);

        if (!$order) {
            throw new \yii\web\NotFoundHttpException("Permintaan lab tidak ditemukan.");
        }

        if ($order->status !== 'pending') {
            Yii::$app->response->statusCode = 422;
            return [
                'status' => 'error',
                'message' => 'Hanya permintaan berstatus pending yang dapat dibatalkan.'
            ];
        }

        $order->status = 'cancelled';

        if ($order->save()) {
            return ['status' => 'success', 'message' => 'Permintaan lab berhasil dibatalkan.', 'data' => $order];
        }

        Yii::$app->response->statusCode = 500;
        return ['status' => 'error', 'message' => 'Gagal membatalkan permintaan lab.'];
    }
}
