'use strict';
module.exports = (sequelize, DataTypes) => {
  const borrower_feedbacks = sequelize.define('borrower_feedbacks', {
    invitation_id: DataTypes.INTEGER,
    collection_id: DataTypes.INTEGER,
    borrower_email: DataTypes.STRING,
    type: DataTypes.STRING,
    comment: DataTypes.STRING,
    created_on: DataTypes.DATE
  }, {
    timestamps: false,
    timestamp: false,
  });
  borrower_feedbacks.associate = function (models) {
    // associations can be defined here
  };
  return borrower_feedbacks;
};