'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'profile_contacts',
      'social_links',
      Sequelize.STRING
    );
    queryInterface.addColumn(
      'profile_contacts',
      'facebook_link',
      Sequelize.STRING
    );
    queryInterface.addColumn(
      'profile_contacts',
      'twitter_link',
      Sequelize.STRING
    );
    queryInterface.addColumn(
      'profile_contacts',
      'instagram_link',
      Sequelize.STRING
    );
    return queryInterface.addColumn(
      'profile_contacts',
      'linkedin_link',
      Sequelize.STRING
    );
  },
  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'business_info',
      'facebook_link',
      Sequelize.STRING
    );
    queryInterface.removeColumn(
      'business_info',
      'twitter_link',
      Sequelize.STRING
    );
    queryInterface.removeColumn(
      'business_info',
      'instagram_link',
      Sequelize.STRING
    );
    return queryInterface.removeColumn(
      'business_info',
      'linkedin_link',
      Sequelize.STRING
    );
  }
};