'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'users',
      'active',
      Sequelize.BOOLEAN
  );
    queryInterface.addColumn(
      'users',
      'disabled',
      Sequelize.BOOLEAN
  );
    queryInterface.addColumn(
      'users',
      'deleted',
      Sequelize.BOOLEAN
  );
   return queryInterface.addColumn(
      'users',
      'deleted_at',
      Sequelize.DATE
  );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('add_boolean_columns_to_users');
  }
};