'use strict';
module.exports = (sequelize, DataTypes) => {
  const some1 = sequelize.define('some1', {
    id: DataTypes.INTEGER
  }, {});
  some1.associate = function(models) {
    // associations can be defined here
  };
  return some1;
};