'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'business_info',
      'website_link',
      Sequelize.STRING
    );
    return queryInterface.removeColumn(
      'business_info',
      'url',
    );



  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('add_boolean_columns_to_users');
  }
};