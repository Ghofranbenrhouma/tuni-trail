// Migration: Create users table

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'Aventurier',
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      avatar: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      role: {
        type: Sequelize.ENUM('user', 'org', 'admin', 'pending_org'),
        allowNull: false,
        defaultValue: 'user',
      },
      activities: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create indexes
    await queryInterface.addIndex('users', ['email'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
