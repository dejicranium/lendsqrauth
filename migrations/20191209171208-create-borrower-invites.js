'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('borrower_invites', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      token: {
        type: Sequelize.STRING,
      },
      profile_created_id: {
        type: Sequelize.INTEGER,
      },
      token_is_used: {
        type: Sequelize.INTEGER,
      },
      borrower_name: {
        type: Sequelize.STRING
      },
      inviter_id: {
        type: Sequelize.INTEGER,
      },
      status: {
        defaultValue: 'Pending',
        type: Sequelize.STRING
      },
      date_invited: {
        type: Sequelize.DATE
      },
      date_joined: {
        type: Sequelize.DATE
      },
      date_declined: {
        type: Sequelize.DATE
      },
      collection_id: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('borrower_invites');
  }
};