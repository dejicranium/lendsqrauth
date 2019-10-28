'use strict';
module.exports = (sequelize, DataTypes) => {
  const role = sequelize.define('role', {
    type: DataTypes.STRING,
    subtype: DataTypes.STRING
  }, {});
  role.associate = function(models) {

  };
  return role;
};