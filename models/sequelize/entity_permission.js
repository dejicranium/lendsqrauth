'use strict';
module.exports = (sequelize, DataTypes) => {
  const entity_permission = sequelize.define('entity_permission', {
    entity: DataTypes.STRING,
    entity_id: DataTypes.INTEGER,
    permission_id: DataTypes.INTEGER,
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
  entity_permission.associate = function(models) {
    // associations can be defined here
  };
  return entity_permission;
};