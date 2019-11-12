'use strict';
module.exports = (sequelize, DataTypes) => {
  const preference = sequelize.define('preference', {
    name: DataTypes.STRING,
    created_on: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
    },
    created_by: DataTypes.INTEGER,
    modified_on: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
    modified_by: DataTypes.INTEGER,
    display: DataTypes.BOOLEAN,
  
  }, {
    timestamps: false
  });
  preference.associate = function(models) {
    // associations can be defined here
  };
  return preference;
};