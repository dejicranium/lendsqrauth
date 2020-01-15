'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        queryInterface.removeColumn(
            'profiles',
            'business_logo',
        );
        queryInterface.removeColumn(
            'profiles',
            'business_logo',
        );
        queryInterface.removeColumn(
            'profiles',
            'business_name',
        );

        queryInterface.removeColumn(
            'profiles',
            'business_phone',
        );
        queryInterface.removeColumn(
            'profiles',
            'rc_number',
        );
        queryInterface.removeColumn(
            'profiles',
            'certificate_of_incorporation',
        );
        queryInterface.removeColumn(
            'profiles',
            'tin_number',
        );
        queryInterface.removeColumn(
            'profiles',
            'state',
        );
        queryInterface.removeColumn(
            'profiles',
            'country',
        );
        return queryInterface.addColumn(
            'products',
            'profile_id',
            Sequelize.INTEGER

        );


    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('add_boolean_columns_to_users');
    }
};