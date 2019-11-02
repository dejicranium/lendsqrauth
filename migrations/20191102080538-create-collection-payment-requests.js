'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('collection_payment_requests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      },
      rejection_reason: {
        type: Sequelize.TEXT
      },
      collection_id: {
        type: Sequelize.INTEGER
      },
      borrower_id: {
        type: Sequelize.INTEGER
      },
      deleted_flag:{
        type: Sequelize.BOOLEAN,
      } ,
      deleted_by:{
        type: Sequelize.INTEGER,
      } ,
      deleted_on:{
        type: Sequelize.DATE,
      } ,
      created_on:{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date()
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
    return queryInterface.dropTable('collection_payment_requests');
  }
};