<?php
return [
    'components' => [
        'response' => [
            'class' => 'yii\web\Response',
            'on beforeSend' => function ($event) {
                $response = $event->sender;
                $response->headers->add('Access-Control-Allow-Origin', '*');
                $response->headers->add('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
                $response->headers->add('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            },
        ],
    ],
];
