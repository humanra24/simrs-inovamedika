<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "visits".
 *
 * @property int $id
 * @property int $patient_id
 * @property int $doctor_id
 * @property int $polyclinic_id
 * @property string $visit_date
 * @property int $queue_number
 * @property string|null $status
 * @property string|null $created_at
 *
 * @property Doctor $doctor
 * @property Patient $patient
 * @property Polyclinic $polyclinic
 */
class Visit extends \yii\db\ActiveRecord
{

    const STATUS_WAITING = 'waiting';
    const STATUS_EXAMINED = 'examined';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'visits';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['status'], 'default', 'value' => 'waiting'],
            [['patient_id', 'doctor_id', 'polyclinic_id', 'visit_date', 'queue_number'], 'required'],
            [['patient_id', 'doctor_id', 'polyclinic_id', 'queue_number'], 'default', 'value' => null],
            [['patient_id', 'doctor_id', 'polyclinic_id', 'queue_number'], 'integer'],
            [['visit_date', 'created_at'], 'safe'],
            [['status'], 'string', 'max' => 20],
            [['polyclinic_id', 'visit_date', 'queue_number'], 'unique', 'targetAttribute' => ['polyclinic_id', 'visit_date', 'queue_number']],
            [['doctor_id'], 'exist', 'skipOnError' => true, 'targetClass' => Doctor::class, 'targetAttribute' => ['doctor_id' => 'id']],
            [['patient_id'], 'exist', 'skipOnError' => true, 'targetClass' => Patient::class, 'targetAttribute' => ['patient_id' => 'id']],
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
            'patient_id' => 'Patient ID',
            'doctor_id' => 'Doctor ID',
            'polyclinic_id' => 'Polyclinic ID',
            'visit_date' => 'Visit Date',
            'queue_number' => 'Queue Number',
            'status' => 'Status',
            'created_at' => 'Created At',
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

    /**
     * Gets query for [[Patient]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getPatient()
    {
        return $this->hasOne(Patient::class, ['id' => 'patient_id']);
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

    public function getMedicalRecord()
    {
        return $this->hasOne(MedicalRecord::class, ['id' => 'visit_id']);
    }

    public function getVisitActions()
    {
        return $this->hasMany(VisitAction::class, ['visit_id' => 'id']);
    }

    public function getPrescription()
    {
        return $this->hasOne(Prescription::class, ['visit_id' => 'id']);
    }

    public static function generateQueueNumber($polyclinic_id, $visit_date)
    {
        $lastVisit = self::find()
            ->where(['polyclinic_id' => $polyclinic_id, 'visit_date' => $visit_date])
            ->orderBy(['queue_number' => SORT_DESC])
            ->one();

        return $lastVisit ? $lastVisit->queue_number + 1 : 1;
    }
}
