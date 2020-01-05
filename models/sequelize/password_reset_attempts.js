'use strict';
module.exports = (sequelize, DataTypes) => {
  const password_reset_attempts = sequelize.define('password_reset_attempts', {
    email: DataTypes.STRING,
    time: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    }
  }, {
    freezeTableName: true,
    timestamps:false
  });
  password_reset_attempts.associate = function(models) {
    // associations can be defined here
  };
  return password_reset_attempts;
};