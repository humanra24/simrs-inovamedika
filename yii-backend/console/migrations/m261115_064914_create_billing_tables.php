<?php

use yii\db\Migration;

class m261115_064914_create_billing_tables extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        // 1. Tabel Tagihan (Header)
        $this->createTable('{{%bills}}', [
            'id' => $this->primaryKey(),
            'visit_id' => $this->integer()->notNull()->unique(),
            'total_amount' => $this->decimal(12, 2)->notNull()->defaultValue(0),
            'paid_amount' => $this->decimal(12, 2)->notNull()->defaultValue(0),
            'status' => $this->string(20)->defaultValue('unpaid'), // unpaid, partial, paid
            'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
            'updated_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
        ]);
        $this->addForeignKey('fk-bills-visit', '{{%bills}}', 'visit_id', '{{%visits}}', 'id', 'CASCADE');

        // 2. Tabel Rincian Biaya
        $this->createTable('{{%bill_items}}', [
            'id' => $this->primaryKey(),
            'bill_id' => $this->integer()->notNull(),
            'item_type' => $this->string(50)->notNull(), // registration, action, medicine, lab
            'reference_id' => $this->integer(), // ID dari visit_actions, prescription_items, dll
            'description' => $this->string(255)->notNull(),
            'amount' => $this->decimal(12, 2)->notNull(),
        ]);
        $this->addForeignKey('fk-bill-items-bill', '{{%bill_items}}', 'bill_id', '{{%bills}}', 'id', 'CASCADE');

        // 3. Tabel Pembayaran
        $this->createTable('{{%payments}}', [
            'id' => $this->primaryKey(),
            'bill_id' => $this->integer()->notNull(),
            'amount' => $this->decimal(12, 2)->notNull(),
            'payment_method' => $this->string(50)->notNull(), // cash, debit, credit, qris
            'idempotency_key' => $this->string(100)->notNull()->unique(), // Skenario 3
            'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
        ]);
        $this->addForeignKey('fk-payments-bill', '{{%payments}}', 'bill_id', '{{%bills}}', 'id', 'CASCADE');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('{{%payments}}');
        $this->dropTable('{{%bill_items}}');
        $this->dropTable('{{%bills}}');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m261115_064914_create_billing_tables cannot be reverted.\n";

        return false;
    }
    */
}
