<?php

namespace api\modules\v1\controllers;

use Yii;
use yii\rest\Controller;
use yii\filters\Cors;
use common\components\JwtAuth;
use common\models\Patient;
use common\models\Polyclinic;
use common\models\Doctor;
use common\models\DoctorSchedule;
use common\models\MedicalAction;
use common\models\Medicine;

class MasterDataController extends Controller
{
    /**
     * Mapping entitas untuk mempermudah CRUD dinamis
     */
    private $entities = [
        'patients' => ['class' => Patient::class, 'search' => ['full_name', 'medical_record_number', 'nik']],
        'polyclinics' => ['class' => Polyclinic::class, 'search' => ['name']],
        'doctors' => ['class' => Doctor::class, 'search' => ['name', 'specialization']],
        'schedules' => ['class' => DoctorSchedule::class, 'search' => []],
        'actions' => ['class' => MedicalAction::class, 'search' => ['name', 'code']],
        'medicines' => ['class' => Medicine::class, 'search' => ['name', 'code']],
    ];

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = ['class' => JwtAuth::class];
        $behaviors['corsFilter'] = ['class' => Cors::class];
        unset($behaviors['contentNegotiator']['formats']['text/html']);
        return $behaviors;
    }

    /**
     * Mendapatkan class model berdasarkan nama entitas
     * @param string $entity
     * @return string
     * @throws \yii\web\NotFoundHttpException
     */
    private function getModelClass($entity)
    {
        if (!isset($this->entities[$entity])) {
            throw new \yii\web\NotFoundHttpException("Entity tidak ditemukan.");
        }
        return $this->entities[$entity]['class'];
    }

    /**
     * GET /api/v1/master/<entity>
     * Menampilkan daftar data dengan fitur pencarian dan filter
     */
    public function actionIndex($entity)
    {
        $modelClass = $this->getModelClass($entity);
        $query = $modelClass::find();

        // Fitur Pencarian (Search) - Case Insensitive
        $search = Yii::$app->request->get('q');
        if ($search && !empty($this->entities[$entity]['search'])) {
            $condition = ['or'];
            foreach ($this->entities[$entity]['search'] as $column) {
                // Menggunakan LOWER() agar pencarian tidak membedakan huruf besar/kecil
                $condition[] = ['like', "LOWER({$column})", '%' . strtolower($search) . '%', false];
            }
            $query->andWhere($condition);
        }

        // Fitur Filter Dinamis (Kecualikan parameter q, page, per-page, entity)
        foreach (Yii::$app->request->get() as $key => $value) {
            if (!in_array($key, ['q', 'page', 'per-page', 'entity'])) {
                $query->andFilterWhere([$key => $value]);
            }
        }

        // Pagination
        $page = Yii::$app->request->get('page', 1);
        $perPage = Yii::$app->request->get('per-page', 10);

        $total = $query->count();
        $data = $query->offset(($page - 1) * $perPage)->limit($perPage)->all();

        return [
            'status' => 'success',
            'total' => (int)$total,
            'page' => (int)$page,
            'data' => $data
        ];
    }

    /**
     * POST /api/v1/master/<entity>
     * Menambahkan data baru
     */
    public function actionCreate($entity)
    {
        $modelClass = $this->getModelClass($entity);
        $model = new $modelClass();
        $model->load(Yii::$app->request->post(), '');

        if ($model->save()) {
            Yii::$app->response->statusCode = 201; // 201 Created
            return ['status' => 'success', 'message' => 'Data berhasil ditambahkan', 'data' => $model];
        }

        // 422 Unprocessable Entity untuk validasi gagal
        Yii::$app->response->statusCode = 422;
        return ['status' => 'error', 'message' => 'Validasi gagal', 'errors' => $model->getErrors()];
    }

    /**
     * GET /api/v1/master/<entity>/<id>
     * Menampilkan detail data berdasarkan ID
     */
    public function actionView($entity, $id)
    {
        $modelClass = $this->getModelClass($entity);
        $model = $modelClass::findOne($id);

        if ($model) {
            return ['status' => 'success', 'data' => $model];
        }
        throw new \yii\web\NotFoundHttpException("Data tidak ditemukan.");
    }

    /**
     * PUT /api/v1/master/<entity>/<id>
     * Mengubah data berdasarkan ID
     */
    public function actionUpdate($entity, $id)
    {
        $modelClass = $this->getModelClass($entity);
        $model = $modelClass::findOne($id);

        if (!$model) {
            throw new \yii\web\NotFoundHttpException("Data tidak ditemukan.");
        }

        $model->load(Yii::$app->request->post(), '');

        if ($model->save()) {
            return ['status' => 'success', 'message' => 'Data berhasil diubah', 'data' => $model];
        }

        Yii::$app->response->statusCode = 422;
        return ['status' => 'error', 'message' => 'Validasi gagal', 'errors' => $model->getErrors()];
    }

    /**
     * DELETE /api/v1/master/<entity>/<id>
     * Menghapus data berdasarkan ID
     */
    public function actionDelete($entity, $id)
    {
        /** @var \yii\db\ActiveRecord $modelClass */
        $modelClass = $this->getModelClass($entity);
        $model = $modelClass::findOne($id);

        if (!$model) {
            throw new \yii\web\NotFoundHttpException("Data tidak ditemukan.");
        }

        if ($model->delete()) {
            return ['status' => 'success', 'message' => 'Data berhasil dihapus'];
        }

        Yii::$app->response->statusCode = 500;
        return ['status' => 'error', 'message' => 'Gagal menghapus data'];
    }
}
