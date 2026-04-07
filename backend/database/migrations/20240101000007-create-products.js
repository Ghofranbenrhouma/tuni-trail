// Migration: Create products table

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      price: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      price_num: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      badge: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      badge_cls: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      icon: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      rating: {
        type: Sequelize.DECIMAL(2, 1),
        defaultValue: 0,
      },
      reviews_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      in_stock: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      css_class: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
    });

    await queryInterface.addIndex('products', ['category']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('products');
  },
};
