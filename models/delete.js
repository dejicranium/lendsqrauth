'use strict';
module.exports = (sequelize, DataTypes) => {
  const delete = sequelize.define('delete', {
    id: DataTypes.INTEGER
  }, {});
  delete.associate = function(models) {
    // associations can be defined here
  };
  return delete;
};