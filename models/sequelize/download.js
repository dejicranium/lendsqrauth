'use strict';
module.exports = (sequelize, DataTypes) => {
  const download = sequelize.define('download', {
    file: DataTypes.STRING,
    url: DataTypes.STRING,
    user_id: DataTypes.INTEGER
  }, {});
  download.associate = function(models) {
    // associations can be defined here
  };
  return download;
};