'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('contact_meta', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      meta: {
        type: Sequelize.TEXT
      },
      deleted_on: {
        type: Sequelize.DATE,
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
      created_on: {
        type: Sequelize.DATE,
        allowNull: false,
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
    return queryInterface.dropTable('contact_meta');
  }
};