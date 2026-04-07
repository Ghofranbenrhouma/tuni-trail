// Migration: Create destinations table

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('destinations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      full_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      altitude: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      difficulty: {
        type: Sequelize.STRING(20),
        defaultValue: 'Facile',
      },
      diff_class: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      duration: {
        type: Sequelize.STRING(20),
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
      lat: {
        type: Sequelize.DECIMAL(10, 6),
        allowNull: true,
      },
      lng: {
        type: Sequelize.DECIMAL(10, 6),
        allowNull: true,
      },
      image: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      highlights: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      season: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      emoji: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      gradient: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
    });

    await queryInterface.addIndex('destinations', ['type']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('destinations');
  },
};
