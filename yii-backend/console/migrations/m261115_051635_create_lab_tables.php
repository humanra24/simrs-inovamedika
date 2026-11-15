<?php

use yii\db\Migration;

class m261115_051635_create_lab_tables extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        // Tabel Permintaan Lab (Order)
        $this->createTable('{{%lab_orders}}', [
            'id' => $this->primaryKey(),
            'visit_id' => $this->integer()->notNull(),
            'test_name' => $this->string(100)->notNull(), // e.g., "Darah Lengkap", "Rontgen Thorax"
            'status' => $this->string(20)->defaultValue('pending'), // pending, in_progress, completed
            'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
        ]);
        $this->addForeignKey('fk-lab-orders-visit', '{{%lab_orders}}', 'visit_id', '{{%visits}}', 'id', 'CASCADE');

        // Tabel Hasil Lab
        $this->createTable('{{%lab_results}}', [
            'id' => $this->primaryKey(),
            'lab_order_id' => $this->integer()->notNull()->unique(),
            'result_data' => $this->text()->notNull(), // JSON atau teks hasil
            'notes' => $this->text(), // Catatan dari petugas lab
            'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
        ]);
        $this->addForeignKey('fk-lab-results-order', '{{%lab_results}}', 'lab_order_id', '{{%lab_orders}}', 'id', 'CASCADE');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('{{%lab_results}}');
        $this->dropTable('{{%lab_orders}}');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m261115_051635_create_lab_tables cannot be reverted.\n";

        return false;
    }
    */
}
