'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_invites', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      inviter: {
        type: Sequelize.INTEGER
      },
      invitee: {
        type: Sequelize.STRING
      },
      token: {
        type:Sequelize.STRING,
      },
      profile_created_id: {
        type:Sequelize.INTEGER,
      },
      user_created_id: {
        type:Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.STRING
      },
      created_on: {
        allowNull: false,
        type: Sequelize.DATE
      },
     
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_invites');
  }
};