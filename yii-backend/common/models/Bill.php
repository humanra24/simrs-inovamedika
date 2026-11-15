<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "bills".
 *
 * @property int $id
 * @property int $visit_id
 * @property float $total_amount
 * @property float $paid_amount
 * @property string|null $status
 * @property string|null $created_at
 * @property string|null $updated_at
 *
 * @property BillItem[] $billItems
 * @property Payment[] $payments
 * @property Visit $visit
 */
class Bill extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'bills';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['paid_amount'], 'default', 'value' => 0],
            [['status'], 'default', 'value' => 'unpaid'],
            [['visit_id'], 'required'],
            [['visit_id'], 'default', 'value' => null],
            [['visit_id'], 'integer'],
            [['total_amount', 'paid_amount'], 'number'],
            [['created_at', 'updated_at'], 'safe'],
            [['status'], 'string', 'max' => 20],
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
            'total_amount' => 'Total Amount',
            'paid_amount' => 'Paid Amount',
            'status' => 'Status',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    public function getVisit()
    {
        return $this->hasOne(Visit::class, ['id' => 'visit_id']);
    }
    public function getItems()
    {
        return $this->hasMany(BillItem::class, ['bill_id' => 'id']);
    }
    public function getPayments()
    {
        return $this->hasMany(Payment::class, ['bill_id' => 'id']);
    }
}
