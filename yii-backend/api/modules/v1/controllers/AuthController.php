<?php

namespace api\modules\v1\controllers;

use Yii;
use yii\rest\Controller;
use common\models\User;

class AuthController extends Controller
{
    public function actionLogin()
    {
        $request = Yii::$app->request;
        $username = $request->post('username');
        $password = $request->post('password');

        $user = User::findByUsername($username);

        if ($user && $user->validatePassword($password)) {
            // Generate JWT Token
            $token = $user->getJwtToken();

            return [
                'status' => 'success',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                ]
            ];
        }

        throw new \yii\web\UnauthorizedHttpException('Username atau password salah.');
    }
}
