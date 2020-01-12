'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
        'collection_schedules',
        'reminder_sent', {
          type: Sequelize.BOOLEAN,
          defaultValue: 0,
          nullable: false

        }
    );



  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('add_boolean_columns_to_users');
  }
};