<?php

declare(strict_types=1);

// Muat file .env
$dotenv = Dotenv\Dotenv::createImmutable(dirname(dirname(__DIR__)));
$dotenv->load();

Yii::setAlias('@common', dirname(__DIR__));
Yii::setAlias('@api', dirname(dirname(__DIR__)) . '/api'); // Ganti @backend menjadi @api
Yii::setAlias('@console', dirname(dirname(__DIR__)) . '/console');
