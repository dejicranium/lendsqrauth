'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('audit_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      action_type: {
        type: Sequelize.STRING
      },
      actor_meta: {
        type: Sequelize.TEXT
      },
      actor_id: {
        type: Sequelize.INTEGER
      },
      action: {
        type: Sequelize.TEXT,
      },
      date: {
        type: Sequelize.DATE
      },
      created_on: {
        type: Sequelize.DATE
      },

    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('audit_logs');
  }
};