'use strict';
module.exports = (sequelize, DataTypes) => {
  const add_account_name_to_bank_info = sequelize.define('add_account_name_to_bank_info', {
    id: DataTypes.INTEGER
  }, {});
  add_account_name_to_bank_info.associate = function(models) {
    // associations can be defined here
  };
  return add_account_name_to_bank_info;
};