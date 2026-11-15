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
                // Rule untuk Auth
                'POST api/v1/auth/login' => 'v1/auth/login',

                // Rule untuk Pasien
                ['class' => 'yii\rest\UrlRule', 'controller' => 'v1/patient', 'prefix' => 'api'],
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
