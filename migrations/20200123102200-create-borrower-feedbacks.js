'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('borrower_feedbacks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      invitation_id: {
        type: Sequelize.INTEGER
      },
      collection_id: {
        type: Sequelize.INTEGER
      },
      borrower_email: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      comment: {
        type: Sequelize.STRING
      },
      created_on: {
        type: Sequelize.DATE
      }

    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('borrower_feedbacks');
  }
};