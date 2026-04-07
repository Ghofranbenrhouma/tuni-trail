// Migration: Create events table

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('events', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      date: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      duration: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      price: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      price_num: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      difficulty: {
        type: Sequelize.STRING(20),
        defaultValue: 'Facile',
      },
      css_class: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      organizer: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      organizer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      rating: {
        type: Sequelize.DECIMAL(2, 1),
        defaultValue: 0,
      },
      reviews_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      includes: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      excludes: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      program: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      lat: {
        type: Sequelize.DECIMAL(10, 6),
        allowNull: true,
      },
      lng: {
        type: Sequelize.DECIMAL(10, 6),
        allowNull: true,
      },
      map_label: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      images: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      max_people: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      min_age: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      options: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('published', 'draft', 'suspended'),
        defaultValue: 'published',
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      sold: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      capacity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      revenue: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('events', ['organizer_id']);
    await queryInterface.addIndex('events', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('events');
  },
};
