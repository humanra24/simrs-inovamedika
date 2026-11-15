<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%medical_records}}`.
 */
class m261115_035848_create_medical_records_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%medical_records}}', [
            'id' => $this->primaryKey(),
            'visit_id' => $this->integer()->notNull()->unique(),

            // --- WAJIB DIISI (NOT NULL) ---
            'anamnesis' => $this->text()->notNull(),
            'physical_exam' => $this->text()->notNull(),
            'primary_diagnosis' => $this->string(255)->notNull(),

            // --- OPSIONAL (NULLABLE) ---
            'secondary_diagnosis' => $this->text(),
            'blood_pressure' => $this->string(20),
            'temperature' => $this->decimal(4, 1),
            'pulse' => $this->integer(),
            'respiratory_rate' => $this->integer(),
            'weight' => $this->decimal(5, 2),
            'height' => $this->decimal(5, 2),

            'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
            'updated_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
        ]);

        // Relasi ke tabel visits
        $this->addForeignKey('fk-medical-records-visit', '{{%medical_records}}', 'visit_id', '{{%visits}}', 'id', 'CASCADE');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('{{%medical_records}}');
    }
}
