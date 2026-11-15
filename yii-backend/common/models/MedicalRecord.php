<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "medical_records".
 *
 * @property int $id
 * @property int $visit_id
 * @property string|null $anamnesis
 * @property string|null $physical_exam
 * @property string|null $primary_diagnosis
 * @property string|null $secondary_diagnosis
 * @property string|null $blood_pressure
 * @property float|null $temperature
 * @property int|null $pulse
 * @property int|null $respiratory_rate
 * @property float|null $weight
 * @property float|null $height
 * @property string|null $created_at
 * @property string|null $updated_at
 *
 * @property Visit $visit
 */
class MedicalRecord extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'medical_records';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['anamnesis', 'physical_exam', 'primary_diagnosis', 'secondary_diagnosis', 'blood_pressure', 'temperature', 'pulse', 'respiratory_rate', 'weight', 'height'], 'default', 'value' => null],
            [['visit_id'], 'required'],
            [['visit_id', 'pulse', 'respiratory_rate'], 'default', 'value' => null],
            [['visit_id', 'pulse', 'respiratory_rate'], 'integer'],
            [['anamnesis', 'physical_exam', 'secondary_diagnosis'], 'string'],
            [['temperature', 'weight', 'height'], 'number'],
            [['created_at', 'updated_at'], 'safe'],
            [['primary_diagnosis'], 'string', 'max' => 255],
            [['blood_pressure'], 'string', 'max' => 20],
            [['visit_id'], 'unique'],
            [['visit_id'], 'exist', 'skipOnError' => true, 'targetClass' => Visit::class, 'targetAttribute' => ['visit_id' => 'id']],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'visit_id' => 'Visit ID',
            'anamnesis' => 'Anamnesis',
            'physical_exam' => 'Physical Exam',
            'primary_diagnosis' => 'Primary Diagnosis',
            'secondary_diagnosis' => 'Secondary Diagnosis',
            'blood_pressure' => 'Blood Pressure',
            'temperature' => 'Temperature',
            'pulse' => 'Pulse',
            'respiratory_rate' => 'Respiratory Rate',
            'weight' => 'Weight',
            'height' => 'Height',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    /**
     * Gets query for [[Visit]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getVisit()
    {
        return $this->hasOne(Visit::class, ['id' => 'visit_id']);
    }
}
