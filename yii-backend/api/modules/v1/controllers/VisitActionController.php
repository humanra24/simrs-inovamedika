<?php

namespace api\modules\v1\controllers;

use Yii;
use yii\rest\Controller;
use yii\filters\Cors;
use common\components\JwtAuth;
use common\components\RoleFilter;
use common\models\Visit;
use common\models\MedicalAction;
use common\models\VisitAction;

class VisitActionController extends Controller
{
    public function behaviors()
    {
        $behaviors = parent::behaviors();
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

    /**
     * GET /api/v1/visit-actions/<visit_id>
     * Menampilkan daftar tindakan untuk kunjungan tertentu
     */
    public function actionIndex($visit_id)
    {
        $visit = Visit::findOne($visit_id);
        if (!$visit) {
            throw new \yii\web\NotFoundHttpException("Data kunjungan tidak ditemukan.");
        }

        $actions = VisitAction::find()
            ->with(['medicalAction'])
            ->where(['visit_id' => $visit_id])
            ->all();

        return [
            'status' => 'success',
            'visit_id' => (int)$visit_id,
            'total' => count($actions),
            'data' => $actions
        ];
    }

    /**
     * POST /api/v1/visit-actions/<visit_id>
     * Menambahkan tindakan ke kunjungan
     * Body: { "medical_action_id": 1 }
     */
    public function actionCreate($visit_id)
    {
        $visit = Visit::findOne($visit_id);
        if (!$visit) {
            throw new \yii\web\NotFoundHttpException("Data kunjungan tidak ditemukan.");
        }

        $medical_action_id = Yii::$app->request->post('medical_action_id');
        if (!$medical_action_id) {
            Yii::$app->response->statusCode = 422;
            return ['status' => 'error', 'message' => 'medical_action_id wajib diisi.'];
        }

        $action = MedicalAction::findOne($medical_action_id);
        if (!$action) {
            Yii::$app->response->statusCode = 422;
            return ['status' => 'error', 'message' => 'Tindakan medis tidak ditemukan.'];
        }

        // Cek duplikasi tindakan yang sama di kunjungan yang sama
        $existing = VisitAction::findOne([
            'visit_id' => $visit_id,
            'medical_action_id' => $medical_action_id
        ]);

        if ($existing) {
            Yii::$app->response->statusCode = 422;
            return ['status' => 'error', 'message' => 'Tindakan ini sudah ditambahkan untuk kunjungan tersebut.'];
        }

        // Simpan dengan snapshot harga
        $model = new VisitAction();
        $model->visit_id = $visit_id;
        $model->medical_action_id = $medical_action_id;
        $model->price = $action->price; // Ambil harga dari master

        if ($model->save()) {
            Yii::$app->response->statusCode = 201;
            return [
                'status' => 'success',
                'message' => 'Tindakan berhasil ditambahkan',
                'data' => $model
            ];
        }

        Yii::$app->response->statusCode = 422;
        return ['status' => 'error', 'message' => 'Gagal menambahkan tindakan', 'errors' => $model->getErrors()];
    }

    /**
     * DELETE /api/v1/visit-actions/<id>
     * Menghapus tindakan (jika dokter salah input)
     */
    public function actionDelete($id)
    {
        $model = VisitAction::findOne($id);
        if (!$model) {
            throw new \yii\web\NotFoundHttpException("Data tindakan tidak ditemukan.");
        }

        if ($model->delete()) {
            return ['status' => 'success', 'message' => 'Tindakan berhasil dihapus'];
        }
        Yii::$app->response->statusCode = 500;
        return ['status' => 'error', 'message' => 'Gagal menghapus tindakan'];
    }
}
