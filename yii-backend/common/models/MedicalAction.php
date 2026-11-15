<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "medical_actions".
 *
 * @property int $id
 * @property string $code
 * @property string $name
 * @property float $price
 * @property string|null $created_at
 */
class MedicalAction extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'medical_actions';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['code'], 'unique'],
            [['code', 'name', 'price'], 'required'],
            [['price'], 'number'],
            [['created_at'], 'safe'],
            [['code'], 'string', 'max' => 20],
            [['name'], 'string', 'max' => 100],
            [['code'], 'unique'],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'code' => 'Code',
            'name' => 'Name',
            'price' => 'Price',
            'created_at' => 'Created At',
        ];
    }
}
