<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "prescriptions".
 *
 * @property int $id
 * @property int $visit_id
 * @property string|null $status
 * @property string|null $created_at
 *
 * @property PrescriptionItem[] $prescriptionItems
 * @property Visit $visit
 */
class Prescription extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'prescriptions';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['status'], 'default', 'value' => 'pending'],
            [['visit_id'], 'required'],
            [['visit_id'], 'default', 'value' => null],
            [['visit_id'], 'integer'],
            [['created_at'], 'safe'],
            [['status'], 'string', 'max' => 20],
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
            'status' => 'Status',
            'created_at' => 'Created At',
        ];
    }

    public function getVisit()
    {
        return $this->hasOne(Visit::class, ['id' => 'visit_id']);
    }

    public function getItems()
    {
        return $this->hasMany(PrescriptionItem::class, ['prescription_id' => 'id']);
    }
}
