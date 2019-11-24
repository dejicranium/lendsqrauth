'use strict';
module.exports = (sequelize, DataTypes) => {
  const product = sequelize.define('product', {
    profile_id: DataTypes.INTEGER,
    product_name: DataTypes.STRING,
    product_description: DataTypes.STRING,
    repayment_model: DataTypes.STRING,
    repayment_method: DataTypes.STRING,
    min_loan_amount: DataTypes.DOUBLE,
    max_loan_amount: DataTypes.DOUBLE,
    min_tenor: DataTypes.STRING,
    max_tenor: DataTypes.STRING,
    tenor_type: DataTypes.STRING,
    interest: DataTypes.DOUBLE,
    status: DataTypes.STRING,
    url_slug: DataTypes.STRING,
    deleted_flag: DataTypes.BOOLEAN,
    created_by: DataTypes.INTEGER,
    modified_on: DataTypes.DATE,
    modified_by: DataTypes.INTEGER,
    deleted_on: DataTypes.DATE,
    deleted_by: DataTypes.INTEGER,
  }, {
    timestamps: false,
  });
  product.associate = function(models) {
    // associations can be defined here
  };
  return product;
};