// Migration: Create wishlist_items table

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('wishlist_items', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      product_id: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('wishlist_items', {
      fields: ['user_id', 'product_id'],
      unique: true,
      name: 'unique_wish_item',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('wishlist_items');
  },
};
