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
            'visit_id' => $this->integer()->notNull()->unique(), // 1 kunjungan = 1 rekam medis
            'anamnesis' => $this->text(), // Keluhan pasien
            'physical_exam' => $this->text(), // Hasil pemeriksaan fisik
            'primary_diagnosis' => $this->string(255), // Diagnosis utama
            'secondary_diagnosis' => $this->text(), // Diagnosis sekunder
            // Tanda-tanda Vital
            'blood_pressure' => $this->string(20), // e.g., "120/80"
            'temperature' => $this->decimal(4, 1), // e.g., 36.5
            'pulse' => $this->integer(), // Detak jantung per menit
            'respiratory_rate' => $this->integer(), // Napas per menit
            'weight' => $this->decimal(5, 2), // Berat badan (kg)
            'height' => $this->decimal(5, 2), // Tinggi badan (cm)
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
