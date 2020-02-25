'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('business_infos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      profile_id: {
        type: Sequelize.INTEGER
      },
      url: {
        type: Sequelize.STRING
      },
      business_logo: {
        type: Sequelize.STRING
      },
      business_name: {
        type: Sequelize.STRING
      },
      business_phone: {
        type: Sequelize.STRING
      },
      rc_number: {
        type: Sequelize.STRING
      },

      certificate_of_incorporation: {
        type: Sequelize.STRING
      },
      tin_number: {
        type: Sequelize.STRING
      },
      state: {
        type: Sequelize.STRING
      },
      meta: {
        type: Sequelize.TEXT
      },
      country: {
        type: Sequelize.STRING
      },
      created_by: {
        type: Sequelize.INTEGER
      },
      created_on: {
        type: Sequelize.DATE
      },
      modified_by: {
        type: Sequelize.INTEGER
      },
      modified_on: {
        type: Sequelize.DATE
      },
      deleted_by: {
        type: Sequelize.INTEGER
      },
      deleted_on: {
        type: Sequelize.DATE
      },
      deleted_flag: {
        allowNull: true,
        type: Sequelize.BOOLEAN
      },

      business_address: {
        allowNull: true,
        type: Sequelize.STRING
      },
      website_link: {
        allowNull: true,
        type: Sequelize.STRING
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('business_infos');
  }
};