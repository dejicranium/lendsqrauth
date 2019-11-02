'use strict';
module.exports = (sequelize, DataTypes) => {
  const collection_debit_schedule = sequelize.define('collection_debit_schedule', {
    lender_acknowledged_payment: DataTypes.BOOLEAN,
    borrower_acknowledged_payment: DataTypes.BOOLEAN,
    collection_id: DataTypes.INTEGER,
    due_date: DataTypes.DATE,
    paid: DataTypes.BOOLEAN,
    amount_to_pay: DataTypes.DOUBLE,
    amount_paid: DataTypes.DOUBLE,
    comment: DataTypes.TEXT,
    date_paid: DataTypes.DATE,
    deleted_flag: DataTypes.BOOLEAN,
    created_by: DataTypes.INTEGER,
    modified_on: DataTypes.DATE,
    modified_by: DataTypes.INTEGER,
    deleted_on: DataTypes.DATE,
    deleted_by: DataTypes.INTEGER,
    deleted_by: DataTypes.INTEGER,
  }, {
    timestamps: false
  });
  collection_debit_schedule.associate = function(models) {
    // associations can be defined here
  };
  return collection_debit_schedule;
};