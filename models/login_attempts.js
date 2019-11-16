'use strict';
module.exports = (sequelize, DataTypes) => {
  const login_attempts = sequelize.define('login_attempts', {
    email: DataTypes.STRING,
    attempted: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
    }
  }, 
  {
    timestamps: true,
  });
  login_attempts.associate = function(models) {
    // associations can be defined here
  };
  return login_attempts;
};