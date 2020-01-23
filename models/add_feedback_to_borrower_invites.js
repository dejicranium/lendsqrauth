'use strict';
module.exports = (sequelize, DataTypes) => {
  const add_feedback_to_borrower_invites = sequelize.define('add_feedback_to_borrower_invites', {
    feedback: DataTypes.TEXT
  }, {});
  add_feedback_to_borrower_invites.associate = function(models) {
    // associations can be defined here
  };
  return add_feedback_to_borrower_invites;
};