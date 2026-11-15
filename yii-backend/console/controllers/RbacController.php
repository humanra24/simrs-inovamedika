<?php

namespace console\controllers;

use Yii;
use yii\console\Controller;
use common\models\User;

class RbacController extends Controller
{
    public function actionInit()
    {
        $auth = Yii::$app->authManager;
        $auth->removeAll(); // Bersihkan data role lama

        // ============================
        // 1. BUAT PERMISSIONS
        // ============================
        $permissions = [
            'manageMasterData' => 'Kelola Master Data',
            'manageRegistration' => 'Kelola Pendaftaran Pasien',
            'manageExamination' => 'Kelola Pemeriksaan Dokter',
            'managePharmacy' => 'Kelola Farmasi dan Resep',
            'manageLab' => 'Kelola Pemeriksaan Penunjang',
            'manageBilling' => 'Kelola Billing dan Pembayaran',
        ];

        $permObjects = [];
        foreach ($permissions as $name => $desc) {
            $perm = $auth->createPermission($name);
            $perm->description = $desc;
            $auth->add($perm);
            $permObjects[$name] = $perm;
        }

        // ============================
        // 2. BUAT ROLES & ASSIGN PERMISSION
        // ============================
        $roles = [
            'Administrator' => ['manageMasterData'], // Admin bisa semua (bisa ditambah)
            'Petugas Pendaftaran' => ['manageRegistration'],
            'Dokter' => ['manageExamination'],
            'Petugas Farmasi' => ['managePharmacy'],
            'Petugas Laboratorium' => ['manageLab'],
            'Kasir' => ['manageBilling'],
        ];

        $roleObjects = [];
        foreach ($roles as $roleName => $perms) {
            $role = $auth->createRole($roleName);
            $auth->add($role);
            $roleObjects[$roleName] = $role;

            foreach ($perms as $permName) {
                $auth->addChild($role, $permObjects[$permName]);
            }
        }

        // ============================
        // 3. BUAT USER DUMMY & ASSIGN ROLE
        // ============================
        $users = [
            ['username' => 'admin', 'role' => 'Administrator'],
            ['username' => 'pendaftaran', 'role' => 'Petugas Pendaftaran'],
            ['username' => 'dokter', 'role' => 'Dokter'],
            ['username' => 'farmasi', 'role' => 'Petugas Farmasi'],
            ['username' => 'lab', 'role' => 'Petugas Laboratorium'],
            ['username' => 'kasir', 'role' => 'Kasir'],
        ];

        foreach ($users as $u) {
            $user = User::findOne(['username' => $u['username']]);
            if (!$user) {
                $user = new User();
                $user->username = $u['username'];
                $user->email = $u['username'] . '@example.com';
                $user->setPassword('123456');
                $user->generateAuthKey();
                $user->status = User::STATUS_ACTIVE;
                $user->save();
            }

            // Assign role ke user
            if (!$auth->getAssignment($u['role'], $user->id)) {
                $auth->assign($roleObjects[$u['role']], $user->id);
            }
        }

        echo "RBAC berhasil diinisialisasi. 6 Role, 6 Permission, dan 6 User Dummy telah dibuat.\n";
    }
}
