<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "doctor_schedules".
 *
 * @property int $id
 * @property int $doctor_id
 * @property int $day_of_week
 * @property string $start_time
 * @property string $end_time
 * @property int|null $quota
 *
 * @property Doctor $doctor
 */
class DoctorSchedule extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'doctor_schedules';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['quota'], 'default', 'value' => 20],
            [['doctor_id', 'day_of_week', 'start_time', 'end_time'], 'required'],
            [['doctor_id', 'day_of_week', 'quota'], 'default', 'value' => null],
            [['doctor_id', 'day_of_week', 'quota'], 'integer'],
            [['start_time', 'end_time'], 'safe'],
            [['doctor_id'], 'exist', 'skipOnError' => true, 'targetClass' => Doctor::class, 'targetAttribute' => ['doctor_id' => 'id']],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'doctor_id' => 'Doctor ID',
            'day_of_week' => 'Day Of Week',
            'start_time' => 'Start Time',
            'end_time' => 'End Time',
            'quota' => 'Quota',
        ];
    }

    /**
     * Gets query for [[Doctor]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getDoctor()
    {
        return $this->hasOne(Doctor::class, ['id' => 'doctor_id']);
    }
}
