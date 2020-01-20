'use strict';
module.exports = (sequelize, DataTypes) => {
  const bvn_verifications = sequelize.define('bvn_verifications', {
    verified: DataTypes.BOOLEAN,
    user_id: DataTypes.INTEGER,
    bvn: DataTypes.INTEGER,
    phone: DataTypes.STRING,
    account_name: DataTypes.STRING
  }, {});
  bvn_verifications.associate = function (models) {
    // associations can be defined here
  };
  return bvn_verifications;
};