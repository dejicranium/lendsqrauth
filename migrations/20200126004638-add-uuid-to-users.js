'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            'users',
            'uuid', {
                type: Sequelize.STRING,

            }
        );



    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('users', 'uuid');
    }
};