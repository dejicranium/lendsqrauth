'use strict';
module.exports = (sequelize, DataTypes) => {
  const delete_profile_columns = sequelize.define('delete_profile_columns', {
    id: DataTypes.INTEGER
  }, {});
  delete_profile_columns.associate = function(models) {
    // associations can be defined here
  };
  return delete_profile_columns;
};