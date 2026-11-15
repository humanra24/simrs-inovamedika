<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "polyclinics".
 *
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string|null $created_at
 *
 * @property Doctors[] $doctors
 */
class Polyclinic extends \yii\db\ActiveRecord
{


    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'polyclinics';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['name'], 'unique'],
            [['description'], 'default', 'value' => null],
            [['name'], 'required'],
            [['description'], 'string'],
            [['created_at'], 'safe'],
            [['name'], 'string', 'max' => 100],
            [['name'], 'unique'],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Name',
            'description' => 'Description',
            'created_at' => 'Created At',
        ];
    }

    /**
     * Gets query for [[Doctors]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getDoctors()
    {
        return $this->hasMany(Doctor::class, ['polyclinic_id' => 'id']);
    }
}
