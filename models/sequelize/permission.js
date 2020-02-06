'use strict';
module.exports = (sequelize, DataTypes) => {
  const permission = sequelize.define('permission', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    deleted_flag: DataTypes.BOOLEAN,
  }, {
    timestamps: false,
  });
  permission.associate = function (models) {
    // associations can be defined here
  };
  return permission;
};