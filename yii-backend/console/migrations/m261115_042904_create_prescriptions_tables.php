<?php

use yii\db\Migration;

class m261115_042904_create_prescriptions_tables extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        // Tabel Header Resep
        $this->createTable('{{%prescriptions}}', [
            'id' => $this->primaryKey(),
            'visit_id' => $this->integer()->notNull(),
            'status' => $this->string(20)->defaultValue('pending'), // pending, dispensed, cancelled
            'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
        ]);
        $this->addForeignKey('fk-prescriptions-visit', '{{%prescriptions}}', 'visit_id', '{{%visits}}', 'id', 'CASCADE');

        // Tabel Detail Item Resep
        $this->createTable('{{%prescription_items}}', [
            'id' => $this->primaryKey(),
            'prescription_id' => $this->integer()->notNull(),
            'medicine_id' => $this->integer()->notNull(),
            'quantity' => $this->integer()->notNull(),
            'dosage' => $this->string(50), // e.g. "3x1"
            'frequency' => $this->string(50), // e.g. "Setelah makan"
            'price' => $this->decimal(12, 2)->notNull(), // Snapshot harga
        ]);
        $this->addForeignKey('fk-presc-items-prescription', '{{%prescription_items}}', 'prescription_id', '{{%prescriptions}}', 'id', 'CASCADE');
        $this->addForeignKey('fk-presc-items-medicine', '{{%prescription_items}}', 'medicine_id', '{{%medicines}}', 'id', 'CASCADE');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('{{%prescription_items}}');
        $this->dropTable('{{%prescriptions}}');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m261115_042904_create_prescriptions_tables cannot be reverted.\n";

        return false;
    }
    */
}
