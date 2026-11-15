<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "medicines".
 *
 * @property int $id
 * @property string $code
 * @property string $name
 * @property string $unit
 * @property float $price
 * @property int $stock
 * @property string|null $created_at
 */
class Medicine extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'medicines';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['code'], 'unique'],
            [['stock'], 'default', 'value' => 0],
            [['code', 'name', 'unit', 'price'], 'required'],
            [['price'], 'number'],
            [['stock'], 'default', 'value' => null],
            [['stock'], 'integer'],
            [['created_at'], 'safe'],
            [['code', 'unit'], 'string', 'max' => 20],
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
            'unit' => 'Unit',
            'price' => 'Price',
            'stock' => 'Stock',
            'created_at' => 'Created At',
        ];
    }
}
