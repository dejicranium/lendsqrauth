'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'users',
      'active',
    );
    queryInterface.removeColumn(
      'users',
      'disabled',
    );
    queryInterface.removeColumn(
      'users',
      'deleted_at',
    );
    return queryInterface.removeColumn(
      'users',
      'bvn',
    );



  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('add_boolean_columns_to_users');
  }
};