'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'business_info',
      'social_links',
      Sequelize.STRING
    );
    queryInterface.addColumn(
      'business_info',
      'facebook_link',
      Sequelize.STRING
    );
    queryInterface.addColumn(
      'business_info',
      'twitter_link',
      Sequelize.STRING
    );
    queryInterface.addColumn(
      'business_info',
      'instagram_link',
      Sequelize.STRING
    );
    queryInterface.addColumn(
      'business_info',
      'linkedin_link',
      Sequelize.STRING
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('add_boolean_columns_to_users');
  }
};