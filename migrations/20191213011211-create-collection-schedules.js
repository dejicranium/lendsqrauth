'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('collection_schedules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      period_id: {
        type: Sequelize.INTEGER
      },
      loan_id: {
        type: Sequelize.INTEGER
      },
      collection_id: {
        type: Sequelize.INTEGER
      },
      days_in_period: {
        type: Sequelize.INTEGER
      },
      interest_due: {
        type: Sequelize.DOUBLE
      },
      principal_due: {
        type: Sequelize.DOUBLE
      },
      total_amount: {
        type: Sequelize.DOUBLE
      },
      borrower_id: {
        type: Sequelize.INTEGER
      },
      borrower_userId: {
        type: Sequelize.INTEGER
      },
      lender_userId: {
        type: Sequelize.INTEGER
      },
      borrower_id: {
        type: Sequelize.INTEGER
      },
      lender_id: {
        type: Sequelize.INTEGER
      },
      fee: {
        type: Sequelize.DOUBLE

      },
      balance_outstanding: {
        type: Sequelize.DOUBLE
      },
      interest_outstanding: {
        type: Sequelize.DOUBLE
      },
      status: {
        type: Sequelize.STRING
      },
      lender_acknowledged_payment: {
        type: Sequelize.BOOLEAN
      },
      borrower_acknowledged_payment: {
        type: Sequelize.BOOLEAN
      },
      from_date: {
        type: Sequelize.DATE,
      },
      due_date: {
        type: Sequelize.DATE,
      },
      created_on: {
        allowNull: false,
        type: Sequelize.DATE
      },
      modified_on: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('collection_schedules');
  }
};