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

    private function getPeriod(): array
    {
        return [
            Yii::$app->request->get('start_date', date('Y-m-01')),
            Yii::$app->request->get('end_date', date('Y-m-d')),
        ];
    }

    /**
     * GET /api/v1/reports/visits
     * Semua kunjungan pada periode (tanpa paginasi), sudah diratakan untuk Excel
     */
    public function actionVisits()
    {
        [$startDate, $endDate] = $this->getPeriod();

        $visits = Visit::find()
            ->with(['patient', 'doctor', 'polyclinic'])
            ->where(['between', 'DATE(visits.visit_date)', $startDate, $endDate])
            ->orderBy(['visits.visit_date' => SORT_DESC])
            ->all();

        $data = [];
        foreach ($visits as $i => $v) {
            $data[] = [
                'No'         => $i + 1,
                'Tanggal'    => $v->visit_date,
                'No Antrean' => $v->queue_number ?? '-',
                'Pasien'     => $v->patient->full_name ?? '-',
                'Poliklinik' => $v->polyclinic->name ?? '-',
                'Dokter'     => $v->doctor->name ?? '-',
                'Status'     => $v->status ?? '-',
            ];
        }

        return ['status' => 'success', 'data' => $data];
    }

    /**
     * GET /api/v1/reports/bills
     * Semua tagihan pada periode (tanpa paginasi), sudah diratakan untuk Excel
     */
    public function actionBills()
    {
        [$startDate, $endDate] = $this->getPeriod();
        $status = Yii::$app->request->get('status');

        $query = Bill::find()
            ->with(['visit.patient'])
            ->where(['between', 'DATE(bills.created_at)', $startDate, $endDate]);

        if ($status) {
            $query->andWhere(['bills.status' => $status]);
        }

        $bills = $query->orderBy(['bills.created_at' => SORT_DESC])->all();

        $data = [];
        foreach ($bills as $i => $b) {
            $data[] = [
                'No'            => $i + 1,
                'Tanggal'       => $b->created_at,
                'Pasien'        => $b->visit->patient->full_name ?? '-',
                'Total Tagihan' => (float) $b->total_amount,
                'Status'        => strtoupper((string) $b->status),
            ];
        }

        return ['status' => 'success', 'data' => $data];
    }

    /**
     * GET /api/v1/reports/medicines
     * Rekap penggunaan obat (resep berstatus dispensed) pada periode
     */
    public function actionMedicines()
    {
        [$startDate, $endDate] = $this->getPeriod();

        $rows = PrescriptionItem::find()
            ->select([
                'medicines.name AS medicine_name',
                'SUM(prescription_items.quantity) AS total_used',
            ])
            ->joinWith(['prescription.visit', 'medicine'], false)
            ->where(['between', 'DATE(visits.visit_date)', $startDate, $endDate])
            ->andWhere(['prescriptions.status' => 'dispensed'])
            ->groupBy(['medicines.id', 'medicines.name'])
            ->orderBy(['total_used' => SORT_DESC])
            ->asArray()
            ->all();

        $data = [];
        foreach ($rows as $i => $r) {
            $data[] = [
                'No'              => $i + 1,
                'Nama Obat'       => $r['medicine_name'],
                'Jumlah Digunakan' => (int) $r['total_used'],
            ];
        }

        return ['status' => 'success', 'data' => $data];
    }
}
