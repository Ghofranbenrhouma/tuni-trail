'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('post_likes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      post_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'community_posts',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    });

    // Add unique constraint
    await queryInterface.addConstraint('post_likes', {
      fields: ['user_id', 'post_id'],
      type: 'unique',
      name: 'unique_post_like',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('post_likes');
  },
};
