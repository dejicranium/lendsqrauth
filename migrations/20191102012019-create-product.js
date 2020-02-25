'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      profile_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'profiles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      product_name: {
        type: Sequelize.STRING
      },
      product_description: {
        type: Sequelize.STRING
      },
      repayment_model: {
        type: Sequelize.STRING
      },
      repayment_method: {
        type: Sequelize.STRING
      },
      min_loan_amount: {
        type: Sequelize.DOUBLE
      },
      max_loan_amount: {
        type: Sequelize.DOUBLE
      },
      uuid: {
        type: Sequelize.STRING
      },

      min_tenor: {
        type: Sequelize.STRING
      },
      max_tenor: {
        type: Sequelize.STRING
      },

      interest: {
        type: Sequelize.DOUBLE
      },
      interest_period: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      url_slug: {
        type: Sequelize.STRING
      },
      deleted_flag: {
        type: Sequelize.BOOLEAN,
      },
      deleted_by: {
        type: Sequelize.INTEGER,
      },
      deleted_on: {
        type: Sequelize.DATE,
      },
      created_on: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date()
      },
      created_by: {
        type: Sequelize.INTEGER,
      },
      modified_on: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date()
      },
      tenor_type: {
        type: Sequelize.STRING,

      },
      modified_by: {
        type: Sequelize.INTEGER,

      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('products');
  }
};