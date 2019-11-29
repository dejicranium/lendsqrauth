'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn(
      'auth_tokens',
      'token',
      {
        type: Sequelize.TEXT
      }
  );
  
  

  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('add_boolean_columns_to_users');
  }
};