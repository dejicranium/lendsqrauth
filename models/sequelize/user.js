"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'user';
  const SCHEMA_DEFINITION = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    first_name: {
      type: DataTypes.STRING(100)
    }
  };
  const SCHEMA_CONFIGURATION = {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: true,
    classMethods: {
      associate: function(models) {
        //model.belongsTo(models.merchant, {allowNull: true});
      }
    }
  };
  const model = sequelize.define(MODEL_NAME, SCHEMA_DEFINITION, SCHEMA_CONFIGURATION);
  return model;
};
