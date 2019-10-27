'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    business_name: DataTypes.STRING,
    password: DataTypes.STRING,
    type: DataTypes.STRING,
    subtype: DataTypes.STRING,
  }, {
  });
  user.associate = function(models) {
    // associations can be defined here
  };
  return user;
};