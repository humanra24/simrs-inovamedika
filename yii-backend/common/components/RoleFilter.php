<?php

namespace common\components;

use Yii;
use yii\base\ActionFilter;
use yii\web\ForbiddenHttpException;

class RoleFilter extends ActionFilter
{
    public $roles = [];

    public function beforeAction($action)
    {
        // Cek apakah user sudah login (identity terisi)
        if (Yii::$app->user->isGuest) {
            throw new \yii\web\UnauthorizedHttpException('Harap login terlebih dahulu.');
        }

        $user = Yii::$app->user->identity;
        $auth = Yii::$app->authManager;
        $userRoles = $auth->getRolesByUser($user->id);

        foreach ($userRoles as $role) {
            if (in_array($role->name, $this->roles)) {
                return true;
            }
        }

        throw new ForbiddenHttpException('Anda tidak memiliki hak akses untuk fitur ini.');
    }
}
