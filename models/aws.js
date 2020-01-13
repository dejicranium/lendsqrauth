'use strict';
module.exports = (sequelize, DataTypes) => {
  const aws = sequelize.define('aws', {
    id: DataTypes.INTEGER
  }, {});
  aws.associate = function(models) {
    // associations can be defined here
  };
  return aws;
};