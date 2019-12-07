'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'profiles',
      'uuid',
      Sequelize.STRING
  );
  
  

  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('add_boolean_columns_to_users');
  }
};