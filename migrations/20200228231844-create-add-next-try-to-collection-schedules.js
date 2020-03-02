'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'collection_schedules',
      'next_try',
      Sequelize.DATE
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'collection_schedules',
      'next_try',
    )
  }
};