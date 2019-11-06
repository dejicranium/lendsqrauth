'use strict';
module.exports = (sequelize, DataTypes) => {
  const permission = sequelize.define('permission', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    created_on: DataTypes.DATE,
    deleted_flag: DataTypes.BOOLEAN,
    created_by: DataTypes.INTEGER,
    modified_on: DataTypes.DATE,
    modified_by: DataTypes.DATE,
    deleted_on: DataTypes.DATE,
    deleted_by: DataTypes.INTEGER,
  }, {
    timestamps: false,
  });
  permission.associate = function(models) {
    // associations can be defined here
  };
  return permission;
};