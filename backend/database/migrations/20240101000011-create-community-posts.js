// Migration: Create community_posts table

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('community_posts', {
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
      author_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      author_avatar: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      image: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      caption: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      likes_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      comments_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('community_posts', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('community_posts');
  },
};
