<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%visits}}`.
 */
class m261115_030515_create_visits_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%visits}}', [
            'id' => $this->primaryKey(),
            'patient_id' => $this->integer()->notNull(),
            'doctor_id' => $this->integer()->notNull(),
            'polyclinic_id' => $this->integer()->notNull(),
            'visit_date' => $this->date()->notNull(),
            'queue_number' => $this->integer()->notNull(),
            'status' => $this->string(20)->defaultValue('waiting'), // waiting, examined, completed, cancelled
            'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
        ]);

        // Relasi antar tabel
        $this->addForeignKey('fk-visits-patient', '{{%visits}}', 'patient_id', '{{%patients}}', 'id', 'CASCADE');
        $this->addForeignKey('fk-visits-doctor', '{{%visits}}', 'doctor_id', '{{%doctors}}', 'id', 'CASCADE');
        $this->addForeignKey('fk-visits-polyclinic', '{{%visits}}', 'polyclinic_id', '{{%polyclinics}}', 'id', 'CASCADE');

        // Index performa & pencegahan duplikasi antrean (Skenario 1 & 6)
        $this->createIndex('idx-visit-date', '{{%visits}}', 'visit_date');
        $this->createIndex('unique-queue', '{{%visits}}', ['polyclinic_id', 'visit_date', 'queue_number'], true);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('{{%visits}}');
    }
}
