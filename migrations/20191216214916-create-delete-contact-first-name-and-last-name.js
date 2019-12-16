'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'profile_contacts',
      'contact_first_name',
    );
    queryInterface.removeColumn(
      'profile_contacts',
      'contact_last_name',
    );
    return queryInterface.addColumn(
      'profile_contacts',
      'contact_name', {
        type: Sequelize.STRING
      }
    );




  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('add_boolean_columns_to_users');
  }
};