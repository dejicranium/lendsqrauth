'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'permissions',
      'deleted_on',
    );
    queryInterface.removeColumn(
      'permissions',
      'deleted_by',
    );
    queryInterface.removeColumn(
      'permissions',
      'modified_by',
    );
    queryInterface.removeColumn(
      'permissions',
      'modified_on',
    );
    queryInterface.removeColumn(
      'permissions',
      'created_on',
    );
    return queryInterface.removeColumn(
      'permissions',
      'created_by',
    );

  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('add_boolean_columns_to_users');
  }
};