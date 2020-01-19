'use strict';
module.exports = (sequelize, DataTypes) => {
  const user_bank = sequelize.define('user_bank', {
    bvn: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    account_number: {
      type: DataTypes.STRING,
      unique: true
    },
    bank_code: DataTypes.STRING,
    account_name: DataTypes.STRING,
    deleted_flag: DataTypes.BOOLEAN,
    created_by: DataTypes.INTEGER,
    modified_on: DataTypes.DATE,
    modified_by: DataTypes.DATE,
    deleted_on: DataTypes.DATE,
    deleted_by: DataTypes.INTEGER,
    is_default: {
      type: DataTypes.BOOLEAN,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_on: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
  }, {
    timestamps: false
  });
  user_bank.associate = function (models) {
    // associations can be defined here
  };
  return user_bank;
};