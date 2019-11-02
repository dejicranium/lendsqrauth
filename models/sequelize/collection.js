'use strict';
module.exports = (sequelize, DataTypes) => {
  const collection = sequelize.define('collection', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile: DataTypes.STRING,
    product_id: DataTypes.INTEGER,
    tenor: DataTypes.STRING,
    borrower_id: DataTypes.INTEGER,
    lender_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    tenor: DataTypes.STRING,
    loan_amount: DataTypes.DOUBLE,
    loan_status: DataTypes.STRING,
    repayment_id: DataTypes.INTEGER,
    start_date: DataTypes.DATE,
    deleted_flag: DataTypes.BOOLEAN,
    created_by: DataTypes.INTEGER,
    modified_on: DataTypes.DATE,
    modified_by: DataTypes.INTEGER,
    deleted_on: DataTypes.DATE,
    deleted_by: DataTypes.INTEGER,
  }, {
    timestamps: false
  });
  collection.associate = function(models) {
    // associations can be defined here
    collection.belongsTo(models.profile, {foreignKey: 'borrower_id', as:'borrower'});
    collection.belongsTo(models.profile, {foreignKey: 'lender_id', as:'lender'});
  };
  return collection;
};