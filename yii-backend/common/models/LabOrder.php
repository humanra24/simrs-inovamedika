<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "lab_orders".
 *
 * @property int $id
 * @property int $visit_id
 * @property string $test_name
 * @property string|null $status
 * @property string|null $created_at
 *
 * @property LabResult $labResults
 * @property Visit $visit
 */
class LabOrder extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'lab_orders';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['status'], 'default', 'value' => 'pending'],
            [['visit_id', 'test_name'], 'required'],
            [['visit_id'], 'default', 'value' => null],
            [['visit_id'], 'integer'],
            [['created_at'], 'safe'],
            [['test_name'], 'string', 'max' => 100],
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
            'test_name' => 'Test Name',
            'status' => 'Status',
            'created_at' => 'Created At',
        ];
    }

    public function getVisit()
    {
        return $this->hasOne(Visit::class, ['id' => 'visit_id']);
    }

    public function getResult()
    {
        return $this->hasOne(LabResult::class, ['lab_order_id' => 'id']);
    }
}
