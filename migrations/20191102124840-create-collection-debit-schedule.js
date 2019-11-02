'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('collection_debit_schedules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      lender_acknowledged_payment: {
        type: Sequelize.BOOLEAN
      },
      borrower_acknowledged_payment: {
        type: Sequelize.BOOLEAN
      },
      collection_id: {
        type: Sequelize.INTEGER
      },
      due_date: {
        type: Sequelize.DATE
      },
      comment: {
        type: Sequelize.TEXT
      },
      amount_to_pay: {
        type: Sequelize.DOUBLE
      },
      amount_paid: {
        type: Sequelize.DOUBLE
      },
      date_paid: {
        type: Sequelize.DATE
      },
      amount_paid: {
        type: Sequelize.DOUBLE
      },
      paid: {
        type: Sequelize.BOOLEAN,
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
    return queryInterface.dropTable('collection_debit_schedules');
  }
};