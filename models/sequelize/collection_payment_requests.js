'use strict';
module.exports = (sequelize, DataTypes) => {
  const collection_payment_requests = sequelize.define('collection_payment_requests', {
    status: DataTypes.STRING,
    rejection_reason: DataTypes.TEXT,
    collection_id: DataTypes.INTEGER,
    borrower_id: DataTypes.INTEGER,
    deleted_flag: DataTypes.BOOLEAN,
    created_by: DataTypes.INTEGER,
    modified_on: DataTypes.DATE,
    modified_by: DataTypes.INTEGER,
    deleted_on: DataTypes.DATE,
    deleted_by: DataTypes.INTEGER,
  }, {
    timestamps:false
  });
  collection_payment_requests.associate = function(models) {
    // associations can be defined here
    collection_payment_requests.belongsTo(models.collection, {foreignKey: 'collection_id'});
    collection_payment_requests.belongsTo(models.profile, {foreignKey: 'borrower_id'});
  };
  return collection_payment_requests;
};