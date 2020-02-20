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
      borrower_first_name: {
        type: Sequelize.STRING,
      },
      borrower_last_name: {
        type: Sequelize.STRING,
      },
      next_reminder_date: {
        type: Sequelize.DATE,
      },
      end_date: {
        type: Sequelize.DATE,
      },
      borrower_email: {
        type: Sequelize.STRING,
      },
      borrower_bvn: {
        type: Sequelize.STRING,
      },
      borrower_phone: {
        type: Sequelize.STRING,
      },
      disbursement_mode: {
        type: Sequelize.STRING
      },
      disbursement_date: {
        type: Sequelize.DATE
      },
      num_of_collections: {
        type: Sequelize.INTEGER
      },
      collection_frequency: {
        type: Sequelize.STRING(10)
      },
      product_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      tenor: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.DOUBLE
      },
      tenor_type: {
        type: Sequelize.STRING
      },
      borrower_id: {
        type: Sequelize.INTEGER
      },
      lender_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'profiles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      lender_name: {
        type: Sequelize.STRING
      },
      tenor: {
        type: Sequelize.STRING
      },
      loan_status: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      repayment_id: {
        type: Sequelize.INTEGER
      },
      start_date: {
        type: Sequelize.DATE
      },
      deleted_flag: {
        type: Sequelize.BOOLEAN,
      },
      deleted_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      modified_on: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date()

      },
      modified_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('collections');
  }
};