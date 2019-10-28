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
    active: DataTypes.BOOLEAN,
    disabled: DataTypes.BOOLEAN,
    deleted: DataTypes.BOOLEAN,
    password: DataTypes.STRING,
    password: DataTypes.STRING,
    type: DataTypes.STRING,
    subtype: DataTypes.STRING,
    deleted_at: DataTypes.DATE,
  }, {
  });
  user.associate = function(models) {
    // associations can be defined here
  };
  return user;
};