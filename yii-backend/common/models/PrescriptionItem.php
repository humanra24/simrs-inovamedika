<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "prescription_items".
 *
 * @property int $id
 * @property int $prescription_id
 * @property int $medicine_id
 * @property int $quantity
 * @property string|null $dosage
 * @property string|null $frequency
 * @property float $price
 *
 * @property Medicine $medicine
 */
class PrescriptionItem extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'prescription_items';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['dosage', 'frequency'], 'default', 'value' => null],
            [['prescription_id', 'medicine_id', 'quantity', 'price'], 'required'],
            [['prescription_id', 'medicine_id', 'quantity'], 'default', 'value' => null],
            [['prescription_id', 'medicine_id', 'quantity'], 'integer'],
            [['price'], 'number'],
            [['dosage', 'frequency'], 'string', 'max' => 50],
            [['medicine_id'], 'exist', 'skipOnError' => true, 'targetClass' => Medicine::class, 'targetAttribute' => ['medicine_id' => 'id']],
            [['prescription_id'], 'exist', 'skipOnError' => true, 'targetClass' => Prescription::class, 'targetAttribute' => ['prescription_id' => 'id']],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'prescription_id' => 'Prescription ID',
            'medicine_id' => 'Medicine ID',
            'quantity' => 'Quantity',
            'dosage' => 'Dosage',
            'frequency' => 'Frequency',
            'price' => 'Price',
        ];
    }

    /**
     * Gets query for [[Medicine]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getMedicine()
    {
        return $this->hasOne(Medicine::class, ['id' => 'medicine_id']);
    }
}
