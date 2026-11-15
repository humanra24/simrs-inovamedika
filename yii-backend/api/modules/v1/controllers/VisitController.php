<?php

namespace api\modules\v1\controllers;

use Yii;
use yii\rest\Controller;
use yii\filters\Cors;
use common\components\JwtAuth;
use common\components\RoleFilter;
use common\models\Visit;
use common\models\DoctorSchedule;

class VisitController extends Controller
{
    public function behaviors()
    {
        $behaviors = parent::behaviors();

        $behaviors['authenticator'] = ['class' => JwtAuth::class];

        // Hanya Petugas Pendaftaran & Administrator yang bisa akses
        $behaviors['roleFilter'] = [
            'class' => RoleFilter::class,
            'roles' => ['Petugas Pendaftaran', 'Administrator'],
        ];

        $behaviors['corsFilter'] = ['class' => Cors::class];
        unset($behaviors['contentNegotiator']['formats']['text/html']);

        return $behaviors;
    }

    /**
     * POST /api/v1/visits/register
     */
    public function actionRegister()
    {
        $request = Yii::$app->request;
        $patient_id = $request->post('patient_id');
        $doctor_id = $request->post('doctor_id');
        $polyclinic_id = $request->post('polyclinic_id');
        $visit_date = $request->post('visit_date', date('Y-m-d'));

        if (!$patient_id || !$doctor_id || !$polyclinic_id) {
            Yii::$app->response->statusCode = 422;
            return ['status' => 'error', 'message' => 'Pasien, Dokter, dan Poli wajib diisi.'];
        }

        // 1. Validasi Jadwal Dokter
        $dayOfWeek = date('N', strtotime($visit_date));
        $schedule = DoctorSchedule::find()
            ->where(['doctor_id' => $doctor_id, 'day_of_week' => $dayOfWeek])
            ->exists();

        if (!$schedule) {
            Yii::$app->response->statusCode = 422;
            return ['status' => 'error', 'message' => 'Dokter tidak memiliki jadwal praktik pada hari tersebut.'];
        }

        // 2. Cek Duplikasi Kunjungan (Skenario 1)
        $existingVisit = Visit::find()
            ->where([
                'patient_id' => $patient_id,
                'polyclinic_id' => $polyclinic_id,
                'visit_date' => $visit_date,
                'status' => [Visit::STATUS_WAITING, Visit::STATUS_EXAMINED]
            ])
            ->one();

        if ($existingVisit) {
            Yii::$app->response->statusCode = 422;
            return [
                'status' => 'error',
                'message' => 'Pasien sudah terdaftar di poli ini hari ini dengan nomor antrean ' . $existingVisit->queue_number
            ];
        }

        // 3. Simpan Kunjungan (Gunakan try-catch untuk mencegah race condition)
        try {
            $visit = new Visit();
            $visit->patient_id = $patient_id;
            $visit->doctor_id = $doctor_id;
            $visit->polyclinic_id = $polyclinic_id;
            $visit->visit_date = $visit_date;
            $visit->queue_number = Visit::generateQueueNumber($polyclinic_id, $visit_date); // Panggil logika dari Model
            $visit->status = Visit::STATUS_WAITING;

            if ($visit->save()) {
                Yii::$app->response->statusCode = 201;
                return [
                    'status' => 'success',
                    'message' => 'Pendaftaran berhasil',
                    'data' => $visit,
                ];
            }
        } catch (\yii\db\IntegrityException $e) {
            // Tangani jika ada race condition (dua request bersamaan)
            Yii::$app->response->statusCode = 409; // Conflict
            return ['status' => 'error', 'message' => 'Antrean sedang diproses oleh sistem, silakan coba lagi.'];
        }

        Yii::$app->response->statusCode = 422;
        return ['status' => 'error', 'message' => 'Gagal mendaftar', 'errors' => $visit->getErrors()];
    }

    /**
     * GET /api/v1/visits/queue
     */
    public function actionQueue()
    {
        $date = Yii::$app->request->get('date', date('Y-m-d'));
        $polyclinic_id = Yii::$app->request->get('polyclinic_id');

        $query = Visit::find()
            ->with(['patient', 'doctor', 'polyclinic'])
            ->where(['visit_date' => $date]);

        if ($polyclinic_id) {
            $query->andWhere(['polyclinic_id' => $polyclinic_id]);
        }

        $visits = $query->orderBy(['queue_number' => SORT_ASC])->all();

        return ['status' => 'success', 'date' => $date, 'total' => count($visits), 'data' => $visits];
    }

    /**
     * GET /api/v1/visits/history/<patient_id>
     */
    public function actionHistory($patient_id)
    {
        $visits = Visit::find()
            ->with(['doctor', 'polyclinic'])
            ->where(['patient_id' => $patient_id])
            ->orderBy(['visit_date' => SORT_DESC])
            ->all();

        return ['status' => 'success', 'total' => count($visits), 'data' => $visits];
    }

    /**
     * PUT /api/v1/visits/update-status/<id>
     */
    public function actionUpdateStatus($id)
    {
        $model = Visit::findOne($id);

        if (!$model) {
            throw new \yii\web\NotFoundHttpException("Data kunjungan tidak ditemukan.");
        }

        $newStatus = Yii::$app->request->post('status');
        $allowedStatus = [Visit::STATUS_WAITING, Visit::STATUS_EXAMINED, Visit::STATUS_COMPLETED, Visit::STATUS_CANCELLED];

        if (!in_array($newStatus, $allowedStatus)) {
            Yii::$app->response->statusCode = 422;
            return ['status' => 'error', 'message' => 'Status tidak valid.'];
        }

        $model->status = $newStatus;
        if ($model->save()) {
            return ['status' => 'success', 'message' => 'Status berhasil diubah', 'data' => $model];
        }

        return ['status' => 'error', 'message' => 'Gagal mengubah status', 'errors' => $model->getErrors()];
    }
}
