'use strict';
module.exports = (sequelize, DataTypes) => {
  const role = sequelize.define('role', {
    type: DataTypes.STRING,
    subtype: DataTypes.STRING
  }, {});
  role.associate = function(models) {
    role.hasMany(models.user_role, {foreignKey: 'role_id'})
  };
  return role;
};