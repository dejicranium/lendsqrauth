'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {

    
     queryInterface.addColumn(
      'collections',
      'borrower_first_name',
      Sequelize.STRING
    );
    
     queryInterface.addColumn(
      'collections',
      'borrower_last_name',
      Sequelize.STRING
    );
    
    return queryInterface.removeColumn(
      'collections',
      'borrower_name'
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('preferences', 'display');
  }
};