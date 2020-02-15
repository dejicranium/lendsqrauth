'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            'collections',
            'end_date',
            Sequelize.DATE
        );


    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('add_boolean_columns_to_users');
    }
};