<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "payments".
 *
 * @property int $id
 * @property int $bill_id
 * @property float $amount
 * @property string $payment_method
 * @property string $idempotency_key
 * @property string|null $created_at
 *
 * @property Bill $bill
 */
class Payment extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'payments';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['bill_id', 'amount', 'payment_method', 'idempotency_key'], 'required'],
            [['bill_id'], 'default', 'value' => null],
            [['bill_id'], 'integer'],
            [['amount'], 'number'],
            [['created_at'], 'safe'],
            [['payment_method'], 'string', 'max' => 50],
            [['idempotency_key'], 'string', 'max' => 100],
            [['idempotency_key'], 'unique'],
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
            'amount' => 'Amount',
            'payment_method' => 'Payment Method',
            'idempotency_key' => 'Idempotency Key',
            'created_at' => 'Created At',
        ];
    }

    public function getBill()
    {
        return $this->hasOne(Bill::class, ['id' => 'bill_id']);
    }
}
