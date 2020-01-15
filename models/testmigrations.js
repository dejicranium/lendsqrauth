'use strict';
module.exports = (sequelize, DataTypes) => {
  const testmigrations = sequelize.define('testmigrations', {
    id: DataTypes.INTEGER
  }, {});
  testmigrations.associate = function(models) {
    // associations can be defined here
  };
  return testmigrations;
};