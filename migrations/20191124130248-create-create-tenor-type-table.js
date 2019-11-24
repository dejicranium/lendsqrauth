'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'products',
      'tenor_type',
      Sequelize.STRING
  );
  
    queryInterface.removeColumn(
      'products',
      'max_tenor_type',
  );
    return queryInterface.removeColumn(
      'products',
      'min_tenor_type',
  );

  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('add_boolean_columns_to_users');
  }
};