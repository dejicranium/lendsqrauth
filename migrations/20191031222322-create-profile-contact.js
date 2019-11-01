'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('profile_contacts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      contact_first_name: {
        type: Sequelize.STRING
      },
      profile_id: {
        type: Sequelize.INTEGER,
      },
      contact_last_name: {
        type: Sequelize.STRING
      },
      contact_phone: {
        type: Sequelize.STRING
      },
      contact_email: {
        type: Sequelize.STRING
      },
      contact_role: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('profile_contacts');
  }
};