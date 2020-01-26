'use strict';
module.exports = (sequelize, DataTypes) => {
  const borrower_invites = sequelize.define('borrower_invites', {
    token: DataTypes.STRING,
    profile_created_id: DataTypes.INTEGER,
    token_is_used: DataTypes.STRING,
    borrower_name: DataTypes.STRING,
    inviter_id: DataTypes.INTEGER,
    collection_id: DataTypes.INTEGER,
    status: DataTypes.STRING,
    date_invited: DataTypes.DATE,
    date_joined: DataTypes.DATE,
    date_declined: DataTypes.DATE,
    collection_id: DataTypes.INTEGER,
    feedback: DataTypes.TEXT
  }, {});
  borrower_invites.associate = function (models) {
    // associations can be defined here
    borrower_invites.belongsTo(models.collection, {
      foreignKey: 'collection_id'
    })
    borrower_invites.belongsTo(models.profile, {
      foreignKey: 'profile_created_id',
      as: 'borrower_profile'
    })
  };
  return borrower_invites;
};