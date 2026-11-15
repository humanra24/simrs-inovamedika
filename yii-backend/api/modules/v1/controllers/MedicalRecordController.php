<?php

namespace api\modules\v1\controllers;

use Yii;
use yii\rest\Controller;
use yii\filters\Cors;
use common\components\JwtAuth;
use common\components\RoleFilter;
use common\models\Visit;
use common\models\MedicalRecord;

class MedicalRecordController extends Controller
{
    public function behaviors()
    {
        $behaviors = parent::behaviors();

        // WAJIB: JwtAuth, bukan HttpBearerAuth
        $behaviors['authenticator'] = ['class' => JwtAuth::class];

        // Hanya Dokter & Administrator
        $behaviors['roleFilter'] = [
            'class' => RoleFilter::class,
            'roles' => ['Dokter', 'Administrator'],
        ];

        $behaviors['corsFilter'] = ['class' => Cors::class];
        unset($behaviors['contentNegotiator']['formats']['text/html']);

        return $behaviors;
    }

    public function actionWaiting()
    {
        $visits = Visit::find()
            ->with(['patient', 'doctor', 'polyclinic'])
            ->where(['status' => Visit::STATUS_WAITING])
            ->orderBy(['queue_number' => SORT_ASC])
            ->asArray()
            ->all();

        return ['status' => 'success', 'total' => count($visits), 'data' => $visits];
    }

    public function actionHistory($visit_id = null)
    {
        $query = Visit::find()
            ->with([
                'patient',
                'doctor',
                'polyclinic',
                'labOrders',
                'labOrders.result',
            ])
            ->orderBy(['visit_date' => SORT_DESC]);

        if ($visit_id !== null) {
            if (!is_numeric($visit_id) || (int) $visit_id <= 0) {
                Yii::$app->response->statusCode = 400;

                return [
                    'status' => 'error',
                    'message' => 'ID pasien tidak valid.',
                ];
            }

            $query->andWhere(['patient_id' => (int) $visit_id]);
        }

        $visits = $query->asArray()->all();

        return [
            'status' => 'success',
            'total' => count($visits),
            'data' => $visits,
        ];
    }

    public function actionCreate($visit_id)
    {
        $visit = Visit::findOne($visit_id);

        if (!$visit) {
            throw new \yii\web\NotFoundHttpException("Data kunjungan tidak ditemukan.");
        }

        $record = MedicalRecord::findOne(['visit_id' => $visit_id]);
        if ($record) {
            Yii::$app->response->statusCode = 422;
            return ['status' => 'error', 'message' => 'Rekam medis untuk kunjungan ini sudah ada.'];
        }

        $model = new MedicalRecord();
        $model->visit_id = $visit_id;
        $model->load(Yii::$app->request->post(), '');

        if ($model->save()) {
            $visit->status = Visit::STATUS_EXAMINED;
            $visit->save();

            Yii::$app->response->statusCode = 201;
            return ['status' => 'success', 'message' => 'Rekam medis berhasil disimpan', 'data' => $model];
        }

        Yii::$app->response->statusCode = 422;
        return ['status' => 'error', 'message' => 'Validasi gagal', 'errors' => $model->getErrors()];
    }

    public function actionView($visit_id)
    {
        $model = MedicalRecord::find()
            ->with(['visit.patient', 'visit.doctor', 'visit.polyclinic'])
            ->where(['visit_id' => $visit_id])
            ->one();

        if ($model) {
            return ['status' => 'success', 'data' => $model];
        }
        throw new \yii\web\NotFoundHttpException("Rekam medis tidak ditemukan.");
    }

    /**
     * PUT /api/v1/medical-records/<visit_id>
     * Mengubah data rekam medis (misal: update diagnosis setelah lab)
     */
    public function actionUpdate($visit_id)
    {
        $model = MedicalRecord::findOne(['visit_id' => $visit_id]);

        if (!$model) {
            throw new \yii\web\NotFoundHttpException("Rekam medis tidak ditemukan.");
        }

        // Load data baru dari request
        $model->load(Yii::$app->request->post(), '');

        if ($model->save()) {
            return [
                'status' => 'success',
                'message' => 'Rekam medis berhasil diubah',
                'data' => $model
            ];
        }

        Yii::$app->response->statusCode = 422;
        return [
            'status' => 'error',
            'message' => 'Validasi gagal',
            'errors' => $model->getErrors()
        ];
    }
}
