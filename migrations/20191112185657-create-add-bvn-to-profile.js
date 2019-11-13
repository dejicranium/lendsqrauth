'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'users',
      'bvn',
      Sequelize.INTEGER
  );
  
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('add_boolean_columns_to_users');
  }
};