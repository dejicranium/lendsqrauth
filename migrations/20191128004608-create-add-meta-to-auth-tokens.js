'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'auth_tokens',
      'meta',
      Sequelize.TEXT
    );



  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('auth_tokens', 'meta');
  }
};