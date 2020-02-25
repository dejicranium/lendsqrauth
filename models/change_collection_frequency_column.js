'use strict';
module.exports = (sequelize, DataTypes) => {
  const change_collection_frequency_column = sequelize.define('change_collection_frequency_column', {
    id: DataTypes.INTEGER
  }, {});
  change_collection_frequency_column.associate = function(models) {
    // associations can be defined here
  };
  return change_collection_frequency_column;
};