<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "bill_items".
 *
 * @property int $id
 * @property int $bill_id
 * @property string $item_type
 * @property int|null $reference_id
 * @property string $description
 * @property float $amount
 *
 * @property Bill $bill
 */
class BillItem extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'bill_items';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['reference_id'], 'default', 'value' => null],
            [['bill_id', 'item_type', 'description', 'amount'], 'required'],
            [['bill_id', 'reference_id'], 'default', 'value' => null],
            [['bill_id', 'reference_id'], 'integer'],
            [['amount'], 'number'],
            [['item_type'], 'string', 'max' => 50],
            [['description'], 'string', 'max' => 255],
            [['bill_id'], 'exist', 'skipOnError' => true, 'targetClass' => Bill::class, 'targetAttribute' => ['bill_id' => 'id']],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'bill_id' => 'Bill ID',
            'item_type' => 'Item Type',
            'reference_id' => 'Reference ID',
            'description' => 'Description',
            'amount' => 'Amount',
        ];
    }

    public function getBill()
    {
        return $this->hasOne(Bill::class, ['id' => 'bill_id']);
    }
}
