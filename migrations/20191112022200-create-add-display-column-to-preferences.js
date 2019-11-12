'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'preferences',
      'display',
      Sequelize.BOOLEAN
  );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('preferences', 'display');
  }
};