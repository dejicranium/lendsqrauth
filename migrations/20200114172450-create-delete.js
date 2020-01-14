'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'permissions',
      'deleted_on',
    );
    return queryInterface.removeColumn(
      'permissions',
      'deleted_by',
    );

  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('add_boolean_columns_to_users');
  }
};