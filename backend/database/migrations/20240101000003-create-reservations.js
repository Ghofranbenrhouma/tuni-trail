// Migration: Create reservations table

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reservations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      ref_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
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
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      event_title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      event_date: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      event_loc: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      event_cls: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      price: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      option_label: {
        type: Sequelize.STRING(50),
        defaultValue: 'Standard',
      },
      ticket_count: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      status: {
        type: Sequelize.ENUM('confirmed', 'pending', 'cancelled'),
        defaultValue: 'confirmed',
      },
      qr_payload: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('reservations', ['user_id']);
    await queryInterface.addIndex('reservations', ['event_id']);
    await queryInterface.addIndex('reservations', ['ref_code'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reservations');
  },
};
