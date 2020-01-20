'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.changeColumn(
      'business_infos',
      'certificate_of_incorporation', {
        type: Sequelize.STRING

      }
    );

    queryInterface.changeColumn(
      'business_infos',
      'state', {
        type: Sequelize.STRING

      }
    );
    queryInterface.changeColumn(
      'business_infos',
      'country', {
        type: Sequelize.STRING

      });
    queryInterface.changeColumn(
      'business_infos',
      'meta', {
        type: Sequelize.TEXT

      });
    return queryInterface.changeColumn(
      'business_infos',
      'modified_by', {
        type: Sequelize.DATE

      });

  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('add_boolean_columns_to_users');
  }
};