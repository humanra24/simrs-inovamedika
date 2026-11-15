<?php

namespace api\modules\v1\controllers;

use yii\rest\ActiveController;
use common\components\JwtAuth;
use yii\filters\Cors;

class PatientController extends ActiveController
{
    public $modelClass = 'common\models\Patient';

    public function behaviors()
    {
        $behaviors = parent::behaviors();

        // Gunakan Custom JWT Auth yang sudah kita buat
        $behaviors['authenticator'] = [
            'class' => JwtAuth::class,
        ];

        // Aktifkan CORS
        $behaviors['corsFilter'] = [
            'class' => Cors::class,
        ];

        return $behaviors;
    }
}
