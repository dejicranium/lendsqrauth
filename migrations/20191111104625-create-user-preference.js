'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_preferences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      preference_id: {
        type: Sequelize.INTEGER
      },
      preference_value: {
        type: Sequelize.STRING
      },
      created_on:{
        type: Sequelize.DATE,
        allowNull: false,
      } ,
      created_by:{
        type: Sequelize.INTEGER,
      } ,
      modified_on:{
        type: Sequelize.DATE,
        allowNull: false,
      },
      modified_by: {
        type: Sequelize.INTEGER,
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_preferences');
  }
};