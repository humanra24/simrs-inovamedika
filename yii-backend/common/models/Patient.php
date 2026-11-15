<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "patients".
 *
 * @property int $id
 * @property string $medical_record_number
 * @property string $nik
 * @property string $full_name
 * @property string $date_of_birth
 * @property string $gender
 * @property string|null $phone_number
 * @property string|null $address
 * @property string|null $created_at
 * @property string|null $updated_at
 */
class Patient extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'patients';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['medical_record_number'], 'unique'],
            [['medical_record_number', 'nik', 'full_name', 'date_of_birth', 'gender'], 'required'],
            [['date_of_birth'], 'safe'],
            [['address'], 'string'],
            [['created_at', 'updated_at'], 'safe'],
            [['medical_record_number'], 'string', 'max' => 20],
            [['nik'], 'string', 'max' => 16],
            [['full_name'], 'string', 'max' => 100],
            [['gender'], 'string', 'max' => 10],
            [['phone_number'], 'string', 'max' => 20],
            [['medical_record_number'], 'unique'],
            [['nik'], 'unique'],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'medical_record_number' => 'Medical Record Number',
            'nik' => 'Nik',
            'full_name' => 'Full Name',
            'date_of_birth' => 'Date Of Birth',
            'gender' => 'Gender',
            'phone_number' => 'Phone Number',
            'address' => 'Address',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }
}
