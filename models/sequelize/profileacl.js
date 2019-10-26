"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'profileacl';
  const SCHEMA_DEFINITION = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    feature: {
      type: DataTypes.STRING(20)
    },
    access: {
      type: DataTypes.STRING(10)
    },
  };
  const SCHEMA_CONFIGURATION = {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: true,
    classMethods: {
      associate: function(models) {
        model.belongsTo(models.profilerole, {allowNull: true});
      }
    }
  };
  const model = sequelize.define(MODEL_NAME, SCHEMA_DEFINITION, SCHEMA_CONFIGURATION);
  return model;
};
