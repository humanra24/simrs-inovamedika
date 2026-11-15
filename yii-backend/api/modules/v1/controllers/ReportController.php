<?php

namespace api\modules\v1\controllers;

use Yii;
use yii\rest\Controller;
use yii\filters\Cors;
use common\components\JwtAuth;
use common\components\RoleFilter;
use common\models\Visit;
use common\models\Bill;
use common\models\PrescriptionItem;
use yii\data\ActiveDataProvider;

class ReportController extends Controller
{
    public function behaviors()
    {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = ['class' => JwtAuth::class];

        // Hanya Admin & Kasir yang bisa akses laporan detail
        $behaviors['roleFilter'] = [
            'class' => RoleFilter::class,
            'roles' => ['Administrator', 'Kasir'],
        ];

        $behaviors['corsFilter'] = ['class' => Cors::class];
        unset($behaviors['contentNegotiator']['formats']['text/html']);
        return $behaviors;
    }

    /**
     * GET /api/v1/reports/visits
     * Laporan rincian kunjungan berdasarkan periode
     */
    public function actionVisits()
    {
        $startDate = Yii::$app->request->get('start_date', date('Y-m-01'));
        $endDate = Yii::$app->request->get('end_date', date('Y-m-d'));

        $query = Visit::find()
            ->with(['patient', 'doctor', 'polyclinic'])
            ->where(['between', 'visit_date', $startDate, $endDate])
            ->orderBy(['visit_date' => SORT_DESC]);

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
            'pagination' => ['pageSize' => 50],
        ]);

        return $dataProvider;
    }

    /**
     * GET /api/v1/reports/bills
     * Laporan rincian tagihan berdasarkan periode
     */
    public function actionBills()
    {
        $startDate = Yii::$app->request->get('start_date', date('Y-m-01'));
        $endDate = Yii::$app->request->get('end_date', date('Y-m-d'));
        $status = Yii::$app->request->get('status');

        $query = Bill::find()
            ->with(['visit.patient'])
            ->where(['between', 'DATE(bills.created_at)', $startDate, $endDate]);

        if ($status) {
            $query->andWhere(['bills.status' => $status]);
        }

        $dataProvider = new ActiveDataProvider([
            'query' => $query->orderBy(['bills.created_at' => SORT_DESC]),
            'pagination' => ['pageSize' => 50],
        ]);

        return $dataProvider;
    }

    /**
     * GET /api/v1/reports/medicines
     * Laporan rincian penggunaan obat berdasarkan periode
     */
    public function actionMedicines()
    {
        $startDate = Yii::$app->request->get('start_date', date('Y-m-01'));
        $endDate = Yii::$app->request->get('end_date', date('Y-m-d'));

        // Query agregasi obat (bisa langsung di Yii2 untuk rincian)
        $query = PrescriptionItem::find()
            ->select(['medicines.name as medicine_name', 'SUM(prescription_items.quantity) as total_used'])
            ->joinWith(['prescription.visit', 'medicine'])
            ->where(['between', 'visits.visit_date', $startDate, $endDate])
            ->andWhere(['prescriptions.status' => 'dispensed'])
            ->groupBy('medicines.id', 'medicines.name')
            ->orderBy(['total_used' => SORT_DESC])
            ->asArray();

        return ['status' => 'success', 'data' => $query->all()];
    }
}
