'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('entity_permissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      entity: {
        type: Sequelize.STRING
      },
      entity_id: {
        type: Sequelize.INTEGER
      },
      permission_id: {
        type: Sequelize.INTEGER
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
        defaultValue: new Date();
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
    return queryInterface.dropTable('entity_permissions');
  }
};