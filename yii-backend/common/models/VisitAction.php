<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "visit_actions".
 *
 * @property int $id
 * @property int $visit_id
 * @property int $medical_action_id
 * @property float $price
 * @property string|null $created_at
 *
 * @property MedicalAction $medicalAction
 * @property Visit $visit
 */
class VisitAction extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'visit_actions';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['visit_id', 'medical_action_id', 'price'], 'required'],
            [['visit_id', 'medical_action_id'], 'default', 'value' => null],
            [['visit_id', 'medical_action_id'], 'integer'],
            [['price'], 'number'],
            [['created_at'], 'safe'],
            [['medical_action_id'], 'exist', 'skipOnError' => true, 'targetClass' => MedicalAction::class, 'targetAttribute' => ['medical_action_id' => 'id']],
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
            'medical_action_id' => 'Medical Action ID',
            'price' => 'Price',
            'created_at' => 'Created At',
        ];
    }

    /**
     * Gets query for [[MedicalAction]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getMedicalAction()
    {
        return $this->hasOne(MedicalAction::class, ['id' => 'medical_action_id']);
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
