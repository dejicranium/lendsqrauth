'use strict';
module.exports = (sequelize, DataTypes) => {
  const some = sequelize.define('some', {
    id: DataTypes.INTEGER
  }, {});
  some.associate = function(models) {
    // associations can be defined here
  };
  return some;
};