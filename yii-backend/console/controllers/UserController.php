<?php

namespace console\controllers;

use Yii;
use yii\console\Controller;
use common\models\User;

class UserController extends Controller
{
    public function actionCreate($email, $username, $password)
    {
        $user = new User();
        $user->username = $username;
        $user->email = $email;
        $user->setPassword($password);
        $user->generateAuthKey();
        $user->status = User::STATUS_ACTIVE;

        if ($user->save()) {
            echo "User '{$username}' berhasil dibuat!\n";
            return 0;
        } else {
            echo "Gagal membuat user:\n";
            print_r($user->getErrors());
            return 1;
        }
    }
}
