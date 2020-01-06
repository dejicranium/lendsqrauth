'use strict';
module.exports = (sequelize, DataTypes) => {
  const user_invites = sequelize.define('user_invites', {
    inviter: DataTypes.INTEGER,
    invitee: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    },
    token: {
      type: DataTypes.STRING,
    },
    profile_created_id: {
      type: DataTypes.INTEGER,
    },
    user_created_id: {
      type: DataTypes.INTEGER,
    },
    created_on: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    }
  }, {
    timestamps: false
  });
  user_invites.associate = function (models) {
    // associations can be defined here
    user_invites.belongsTo(models.profile, {
      foreignKey: 'profile_created_id',
    })
  };
  return user_invites;
};