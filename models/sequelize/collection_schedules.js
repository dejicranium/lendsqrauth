'use strict';
module.exports = (sequelize, DataTypes) => {
  const collection_schedules = sequelize.define('collection_schedules', {
    period_id: DataTypes.INTEGER,

    loan_id: DataTypes.INTEGER,

    from_date: DataTypes.DATE,

    due_date: DataTypes.DATE,

    collection_id: DataTypes.INTEGER,

    days_in_period: DataTypes.INTEGER,
    interest_due: DataTypes.DOUBLE,

    principal_due: DataTypes.DOUBLE,
    balance_outstanding: DataTypes.DOUBLE,
    interest_outstanding: DataTypes.DOUBLE,

    total_amount: DataTypes.DOUBLE,
    lender_userId: DataTypes.INTEGER,
    borrower_userId: DataTypes.INTEGER,
    borrower_id: DataTypes.INTEGER,

    lender_id: DataTypes.INTEGER,

    status: DataTypes.STRING,
    fee: DataTypes.DOUBLE,

    lender_acknowledged_payment: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0
    },

    borrower_acknowledged_payment: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0
    },

    created_on: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    },

    modified_on: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    }
  }, {
    timestamps: false
  });
  collection_schedules.associate = function (models) {
    // associations can be defined here
    collection_schedules.belongsTo(models.profile, {
      foreignKey: 'lender_id',
    })
    collection_schedules.belongsTo(models.profile, {
      foreignKey: 'borrower_id',
    })
    collection_schedules.belongsTo(models.product, {
      foreignKey: 'loan_id'
    })
    collection_schedules.belongsTo(models.collection, {
      foreignKey: 'collection_id'
    })


  };
  return collection_schedules;
};