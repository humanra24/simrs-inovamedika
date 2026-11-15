<?php

use yii\db\Migration;

class m261115_004225_create_master_data_tables extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        // ==========================================
        // 1. TABEL PASIEN
        // ==========================================
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

        // ==========================================
        // 2. TABEL POLI
        // ==========================================
        $this->createTable('{{%polyclinics}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(100)->notNull()->unique(),
            'description' => $this->text(),
            'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
        ]);

        // ==========================================
        // 3. TABEL DOKTER
        // ==========================================
        $this->createTable('{{%doctors}}', [
            'id' => $this->primaryKey(),
            'polyclinic_id' => $this->integer()->notNull(),
            'name' => $this->string(100)->notNull(),
            'specialization' => $this->string(100),
            'phone_number' => $this->string(20),
            'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
        ]);
        $this->addForeignKey('fk-doctors-polyclinics', '{{%doctors}}', 'polyclinic_id', '{{%polyclinics}}', 'id', 'CASCADE');

        // ==========================================
        // 4. TABEL JADWAL PRAKTIK DOKTER
        // ==========================================
        $this->createTable('{{%doctor_schedules}}', [
            'id' => $this->primaryKey(),
            'doctor_id' => $this->integer()->notNull(),
            'day_of_week' => $this->integer()->notNull(), // 1=Senin, 7=Minggu
            'start_time' => $this->time()->notNull(),
            'end_time' => $this->time()->notNull(),
            'quota' => $this->integer()->defaultValue(20),
        ]);
        $this->addForeignKey('fk-schedule-doctor', '{{%doctor_schedules}}', 'doctor_id', '{{%doctors}}', 'id', 'CASCADE');

        // ==========================================
        // 5. TABEL TINDAKAN MEDIS
        // ==========================================
        $this->createTable('{{%medical_actions}}', [
            'id' => $this->primaryKey(),
            'code' => $this->string(20)->notNull()->unique(),
            'name' => $this->string(100)->notNull(),
            'price' => $this->decimal(12, 2)->notNull(),
            'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
        ]);

        // ==========================================
        // 6. TABEL OBAT & STOK
        // ==========================================
        $this->createTable('{{%medicines}}', [
            'id' => $this->primaryKey(),
            'code' => $this->string(20)->notNull()->unique(),
            'name' => $this->string(100)->notNull(),
            'unit' => $this->string(20)->notNull(), // Tablet, Sirup, dll
            'price' => $this->decimal(12, 2)->notNull(),
            'stock' => $this->integer()->notNull()->defaultValue(0),
            'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('{{%medicines}}');
        $this->dropTable('{{%medical_actions}}');
        $this->dropTable('{{%doctor_schedules}}');
        $this->dropTable('{{%doctors}}');
        $this->dropTable('{{%polyclinics}}');
        $this->dropTable('{{%patients}}');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m261115_004225_create_master_data_tables cannot be reverted.\n";

        return false;
    }
    */
}
