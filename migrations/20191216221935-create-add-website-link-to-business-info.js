'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {

    queryInterface.removeColumn(
      'business_infos',
      'url',
    );
    return queryInterface.addColumn(
      'business_infos',
      'website_link',
      Sequelize.STRING
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('add_boolean_columns_to_users');
  }
};