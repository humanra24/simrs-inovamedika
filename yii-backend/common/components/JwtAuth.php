<?php

namespace common\components;

use Yii; // <-- Tambahkan ini
use yii\filters\auth\AuthMethod;
use yii\web\UnauthorizedHttpException;
use common\models\User;

class JwtAuth extends AuthMethod
{
    public function authenticate($user, $request, $response)
    {
        $authHeader = $request->getHeaders()->get('Authorization');

        if ($authHeader !== null && preg_match('/^Bearer\s+(.*?)$/', $authHeader, $matches)) {
            $token = $matches[1];
            $parts = explode('.', $token);

            if (count($parts) !== 3) {
                throw new UnauthorizedHttpException('Format token tidak valid.');
            }

            list($header, $payload, $signature) = $parts;

            $secret = $_ENV['JWT_SECRET'] ?? 'RAHASIAKU_1234567890';
            $validSignature = hash_hmac('sha256', $header . "." . $payload, $secret, true);
            $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($validSignature));

            if (!hash_equals($base64UrlSignature, $signature)) {
                throw new UnauthorizedHttpException('Signature token tidak valid.');
            }

            $decodedPayload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);

            if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
                throw new UnauthorizedHttpException('Token sudah kadaluarsa.');
            }

            $userModel = User::findIdentity($decodedPayload['sub']);
            if ($userModel) {
                // INI BAGIAN YANG HILANG: Simpan identitas ke Yii2
                Yii::$app->user->setIdentity($userModel);
                return $userModel;
            }
        }

        return null;
    }
}
