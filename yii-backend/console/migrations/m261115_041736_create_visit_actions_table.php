<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%visit_actions}}`.
 */
class m261115_041736_create_visit_actions_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%visit_actions}}', [
            'id' => $this->primaryKey(),
            'visit_id' => $this->integer()->notNull(),
            'medical_action_id' => $this->integer()->notNull(),
            'price' => $this->decimal(12, 2)->notNull(), // Snapshot harga saat tindakan dilakukan
            'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
        ]);

        // Relasi
        $this->addForeignKey('fk-visit-actions-visit', '{{%visit_actions}}', 'visit_id', '{{%visits}}', 'id', 'CASCADE');
        $this->addForeignKey('fk-visit-actions-action', '{{%visit_actions}}', 'medical_action_id', '{{%medical_actions}}', 'id', 'CASCADE');

        // Index untuk performa
        $this->createIndex('idx-visit-actions-visit', '{{%visit_actions}}', 'visit_id');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('{{%visit_actions}}');
    }
}
