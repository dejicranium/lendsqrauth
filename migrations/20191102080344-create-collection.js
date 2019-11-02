'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('collections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      mobile: {
        type: Sequelize.STRING
      },
      product_id: {
        type: Sequelize.INTEGER
      },
      tenor: {
        type: Sequelize.STRING
      },
      borrower_id: {
        type: Sequelize.INTEGER
      },
      lender_id: {
        type: Sequelize.INTEGER
      },
      product_id: {
        type: Sequelize.INTEGER
      },
      tenor: {
        type: Sequelize.STRING
      },
      loan_amount: {
        type: Sequelize.DOUBLE
      },
      loan_status: {
        type: Sequelize.STRING
      },
      repayment_id: {
        type: Sequelize.INTEGER
      },
      start_date: {
        type: Sequelize.DATE
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
    return queryInterface.dropTable('collections');
  }
};