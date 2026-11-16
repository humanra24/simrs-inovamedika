<?php

namespace common\components;

use Yii;
use yii\base\ActionFilter;
use yii\web\ForbiddenHttpException;
use yii\web\UnauthorizedHttpException;

class RoleFilter extends ActionFilter
{
    public $roles = [];
    public $only = [];
    public $except = [];

    public function beforeAction($action)
    {
        $actionId = $action->id;

        // Lewati pemeriksaan jika action tidak termasuk daftar only.
        if (!empty($this->only) && !in_array($actionId, $this->only, true)) {
            return true;
        }

        // Lewati pemeriksaan jika action termasuk daftar except.
        if (in_array($actionId, $this->except, true)) {
            return true;
        }

        if (Yii::$app->user->isGuest) {
            throw new UnauthorizedHttpException(
                'Harap login terlebih dahulu.'
            );
        }

        $user = Yii::$app->user->identity;
        $auth = Yii::$app->authManager;
        $userRoles = $auth->getRolesByUser($user->id);

        foreach ($userRoles as $role) {
            if (in_array($role->name, $this->roles, true)) {
                return true;
            }
        }

        throw new ForbiddenHttpException(
            'Anda tidak memiliki hak akses untuk fitur ini.'
        );
    }
}
