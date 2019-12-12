'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'profile_contacts',
      'social_links',
      Sequelize.TEXT
    );



  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'profile_contacts',
      'social_links',
    );
  }
};