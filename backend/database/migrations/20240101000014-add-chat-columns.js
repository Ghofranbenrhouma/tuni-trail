'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add missing columns to chat_messages
    await queryInterface.addColumn('chat_messages', 'author_name', {
      type: Sequelize.STRING(100),
    });

    await queryInterface.addColumn('chat_messages', 'author_avatar', {
      type: Sequelize.STRING(10),
    });

    await queryInterface.addColumn('chat_messages', 'is_ai', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('chat_messages', 'author_name');
    await queryInterface.removeColumn('chat_messages', 'author_avatar');
    await queryInterface.removeColumn('chat_messages', 'is_ai');
  },
};
