"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'roletype';
  const SCHEMA_DEFINITION = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ptype: {
      type: DataTypes.STRING(20)
    },
    psubtype: {
      type: DataTypes.STRING(20)
    },
  };
  const SCHEMA_CONFIGURATION = {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: true,
    classMethods: {
      associate: function(models) {
        
      }
    }
  };
  const model = sequelize.define(MODEL_NAME, SCHEMA_DEFINITION, SCHEMA_CONFIGURATION);
  return model;
};
