<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "doctors".
 *
 * @property int $id
 * @property int $polyclinic_id
 * @property string $name
 * @property string|null $specialization
 * @property string|null $phone_number
 * @property string|null $created_at
 *
 * @property DoctorSchedule[] $doctorSchedules
 * @property Polyclinic $polyclinic
 */
class Doctor extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'doctors';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['specialization', 'phone_number'], 'default', 'value' => null],
            [['polyclinic_id', 'name'], 'required'],
            [['polyclinic_id'], 'default', 'value' => null],
            [['polyclinic_id'], 'integer'],
            [['created_at'], 'safe'],
            [['name', 'specialization'], 'string', 'max' => 100],
            [['phone_number'], 'string', 'max' => 20],
            [['polyclinic_id'], 'exist', 'skipOnError' => true, 'targetClass' => Polyclinic::class, 'targetAttribute' => ['polyclinic_id' => 'id']],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'polyclinic_id' => 'Polyclinic ID',
            'name' => 'Name',
            'specialization' => 'Specialization',
            'phone_number' => 'Phone Number',
            'created_at' => 'Created At',
        ];
    }

    /**
     * Gets query for [[DoctorSchedules]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getDoctorSchedules()
    {
        return $this->hasMany(DoctorSchedule::class, ['doctor_id' => 'id']);
    }

    /**
     * Gets query for [[Polyclinic]].
     *
     * @return \yii\db\ActiveQuery
     */

    public function getPolyclinic()
    {
        return $this->hasOne(Polyclinic::class, ['id' => 'polyclinic_id']);
    }
}
