<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "lab_results".
 *
 * @property int $id
 * @property int $lab_order_id
 * @property string $result_data
 * @property string|null $notes
 * @property string|null $created_at
 *
 * @property LabOrder $labOrder
 */
class LabResult extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'lab_results';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['notes'], 'default', 'value' => null],
            [['lab_order_id', 'result_data'], 'required'],
            [['lab_order_id'], 'default', 'value' => null],
            [['lab_order_id'], 'integer'],
            [['result_data', 'notes'], 'string'],
            [['created_at'], 'safe'],
            [['lab_order_id'], 'unique'],
            [['lab_order_id'], 'exist', 'skipOnError' => true, 'targetClass' => LabOrder::class, 'targetAttribute' => ['lab_order_id' => 'id']],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'lab_order_id' => 'Lab Order ID',
            'result_data' => 'Result Data',
            'notes' => 'Notes',
            'created_at' => 'Created At',
        ];
    }

    /**
     * Gets query for [[LabOrder]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getLabOrder()
    {
        return $this->hasOne(LabOrder::class, ['id' => 'lab_order_id']);
    }
}
