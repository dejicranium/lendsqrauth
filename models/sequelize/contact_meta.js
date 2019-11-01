'use strict';
module.exports = (sequelize, DataTypes) => {
  const contact_meta = sequelize.define('contact_meta', {
    meta: DataTypes.TEXT,
    created_on: DataTypes.DATE,
    created_by: DataTypes.INTEGER,
    modified_on: DataTypes.DATE,
    modified_by: DataTypes.DATE,
    deleted_on: DataTypes.DATE,
    deleted_by: DataTypes.INTEGER,
  }, {
    timestamps: false,
  });
  contact_meta.associate = function(models) {
    // associations can be defined here
  };
  return contact_meta;
};