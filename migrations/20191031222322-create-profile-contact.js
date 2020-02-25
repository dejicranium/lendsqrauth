'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('profile_contacts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      profile_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'profiles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      contact_name: {
        type: Sequelize.STRING
      },
      facebook_link: {
        type: Sequelize.STRING
      },
      twitter_link: {
        type: Sequelize.STRING
      },
      linkedin_link: {
        type: Sequelize.STRING
      },
      instagram_link: {
        type: Sequelize.STRING
      },
      contact_phone: {
        type: Sequelize.STRING
      },
      contact_email: {
        type: Sequelize.STRING
      },
      support_email: {
        type: Sequelize.STRING
      },
      contact_role: {
        type: Sequelize.STRING
      },
      deleted_on: {
        type: Sequelize.DATE,
      },
      deleted_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_on: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      modified_on: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date()

      },
      modified_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('profile_contacts');
  }
};