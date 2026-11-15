<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%patients}}`.
 */
class m261114_232825_create_patients_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%patients}}', [
            'id' => $this->primaryKey(),
            'medical_record_number' => $this->string(20)->notNull()->unique(),
            'nik' => $this->string(16)->notNull()->unique(),
            'full_name' => $this->string(100)->notNull(),
            'date_of_birth' => $this->date()->notNull(),
            'gender' => $this->string(10)->notNull(),
            'phone_number' => $this->string(20),
            'address' => $this->text(),
            'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
            'updated_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
        ]);

        $this->createIndex('idx-patient-name', '{{%patients}}', 'full_name');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('{{%patients}}');
    }
}
