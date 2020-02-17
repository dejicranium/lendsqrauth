'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('roles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      deleted_on: {
        type: Sequelize.DATE,
      },
      deleted_flag: {
        type: Sequelize.BOOLEAN,
      },
      deleted_by: {
        type: Sequelize.INTEGER,
      },
      created_on: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_by: {
        type: Sequelize.INTEGER,
      },
      modified_on: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date()

      },
      modified_by: {
        type: Sequelize.INTEGER,
        created_by: {
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('roles');
  }
};