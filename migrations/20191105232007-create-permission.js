'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('permissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      deleted_flag: {
        type: Sequelize.BOOLEAN
      },
      deleted_on:{
        type: Sequelize.DATE,
      } ,
      deleted_by:{
        type: Sequelize.INTEGER,
      } ,
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
        defaultValue: new Date()

      },
      modified_by: {
        type: Sequelize.INTEGER,
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('permissions');
  }
};