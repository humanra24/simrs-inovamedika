<?php
return [
    'id' => 'app-api',
    'basePath' => dirname(__DIR__),
    'controllerNamespace' => 'api\controllers',
    'bootstrap' => ['log'],
    'modules' => [
        'v1' => [
            'class' => 'api\modules\v1\Module',
        ],
    ],
    'components' => [
        'request' => [
            'cookieValidationKey' => 'RAHASIA_API_123',
            'parsers' => [
                'application/json' => 'yii\web\JsonParser',
            ],
        ],
        'user' => [
            'identityClass' => 'common\models\User',
            'enableAutoLogin' => false,
            'enableSession' => false,
        ],
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning'],
                ],
            ],
        ],
        'urlManager' => [
            'enablePrettyUrl' => true,
            'showScriptName' => false,
            'rules' => [
                'POST api/v1/auth/login' => 'v1/auth/login',

                // Master Data
                'GET api/v1/master/<entity>' => 'v1/master-data/index',
                'POST api/v1/master/<entity>' => 'v1/master-data/create',
                'GET api/v1/master/<entity>/<id:\d+>' => 'v1/master-data/view',
                'PUT api/v1/master/<entity>/<id:\d+>' => 'v1/master-data/update',
                'DELETE api/v1/master/<entity>/<id:\d+>' => 'v1/master-data/delete',

                // Pendaftaran & Antrean
                'PUT api/v1/visits/update-status/<id:\d+>' => 'v1/visit/update-status',
                'GET api/v1/visits/history/<patient_id:\d+>' => 'v1/visit/history',
                'POST api/v1/visits/register' => 'v1/visit/register',
                'GET api/v1/visits/queue' => 'v1/visit/queue',

                // Pemeriksaan (EMR)
                'GET api/v1/medical-records/waiting' => 'v1/medical-record/waiting',
                'POST api/v1/medical-records/<visit_id:\d+>' => 'v1/medical-record/create',
                'PUT api/v1/medical-records/<visit_id:\d+>' => 'v1/medical-record/update',
                'GET api/v1/medical-records/<visit_id:\d+>' => 'v1/medical-record/view',

                // Tindakan Medis
                'GET api/v1/visit-actions/<visit_id:\d+>' => 'v1/visit-action/index',
                'POST api/v1/visit-actions/<visit_id:\d+>' => 'v1/visit-action/create',
                'DELETE api/v1/visit-actions/<id:\d+>' => 'v1/visit-action/delete',

                // Farmasi / Resep
                'POST api/v1/prescriptions/<visit_id:\d+>' => 'v1/prescription/create',
                'GET api/v1/prescriptions/pending' => 'v1/prescription/pending',
                'POST api/v1/prescriptions/<id:\d+>/dispense' => 'v1/prescription/dispense',
                'DELETE api/v1/prescriptions/<id:\d+>' => 'v1/prescription/delete',
            ],
        ],
        'jwt' => [
            'class' => \sizeg\jwt\Jwt::class,
            'key' => 'f8c2a91d7e4b6035a9f1c8d2e7b4063f91a5c0e8d3f729b6a4c1e9f0d5b8237a',
        ],
        'errorHandler' => [
            'class' => 'yii\web\ErrorHandler',
            'errorAction' => null,
            'exceptionView' => null,
            'errorView' => null,
        ],
    ],
    'params' => [],
];
