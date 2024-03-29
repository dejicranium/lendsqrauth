'use strict';
module.exports = (sequelize, DataTypes) => {
  const auth_token = sequelize.define('auth_token', {
    type: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    token: DataTypes.STRING,
    expiry: DataTypes.DATE,
    is_used: DataTypes.BOOLEAN,
    meta: DataTypes.TEXT,
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    }
  }, {});
  auth_token.associate = function (models) {
    // associations can be defined here
    auth_token.belongsTo(models.user, {
      foreignKey: 'user_id'
    })
  };
  return auth_token;
};