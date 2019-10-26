"use strict";
module.exports = function (sequelize, DataTypes) {
  const MODEL_NAME = 'contact';
  const SCHEMA_DEFINITION = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ctype: {
      type: DataTypes.STRING(20),
    },
    cval: {
      type: DataTypes.STRING(150),
    }
  };
  const SCHEMA_CONFIGURATION = {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: true,
    classMethods: {
      associate: function(models) {
        model.belongsTo(models.user, {allowNull: true});
      }
    }
  };
  const model = sequelize.define(MODEL_NAME, SCHEMA_DEFINITION, SCHEMA_CONFIGURATION);
  return model;
};
