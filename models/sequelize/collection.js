'use strict';
module.exports = (sequelize, DataTypes) => {
  const collection = sequelize.define('collection', {
    product_id: DataTypes.INTEGER,
    tenor: DataTypes.STRING,
    borrower_id: DataTypes.INTEGER,
    borrower_name: DataTypes.STRING,
    borrower_email: DataTypes.STRING,
    borrower_phone: DataTypes.STRING,
    borrower_bvn: DataTypes.STRING,
    lender_name: DataTypes.STRING,
    lender_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    loan_status: DataTypes.STRING,
    disbursement_mode: DataTypes.STRING,
    disbursement_date: DataTypes.DATE,
    num_of_collections: DataTypes.INTEGER,
    collection_frequency: DataTypes.INTEGER,
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
    collection.belongsTo(models.product, {foreignKey: 'product_id', as:'product'});
  };
  return collection;
};