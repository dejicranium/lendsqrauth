'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('profiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      role_id: {
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        created_by: {
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
      },
      parent_profile_id: {
        type: Sequelize.INTEGER,
        created_by: {
          type: Sequelize.INTEGER,
          references: {
            model: 'profiles',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
      },
      deleted_flag: {
        type: Sequelize.BOOLEAN
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
      country: {
        type: Sequelize.STRING
      },
      deleted_on: {
        type: Sequelize.DATE,
      },
      deleted_flag: {
        type: Sequelize.BOOLEAN,
      },
      deleted_by: {
        type: Sequelize.INTEGER,
      },
      created_on: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_by: {
        type: Sequelize.INTEGER,
      },
      bvn: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.STRING
      },
      modified_on: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date()
      },
      uuid: {
        type: Sequelize.STRING
      },
      modified_by: {
        type: Sequelize.INTEGER,
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('profiles');
  }
};