'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            'users',
            'status_reason',
            Sequelize.TEXT

        );



    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('add_boolean_columns_to_users');
    }
};