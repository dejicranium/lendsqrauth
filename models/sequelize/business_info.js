'use strict';
module.exports = (sequelize, DataTypes) => {
  const business_info = sequelize.define('business_info', {
    profile_id: DataTypes.INTEGER,
    website_link: DataTypes.STRING,
    business_logo: DataTypes.STRING,
    business_name: DataTypes.STRING,
    business_phone: DataTypes.STRING,
    rc_number: {
      type: DataTypes.STRING,
      unique: true
    },
    certificate_of_incorporation: DataTypes.STRING,
    tin_number: DataTypes.STRING,
    state: DataTypes.STRING,
    meta: DataTypes.TEXT,
    country: DataTypes.STRING,
    deleted_flag: DataTypes.BOOLEAN,
    created_by: DataTypes.INTEGER,
    modified_on: DataTypes.DATE,
    modified_by: DataTypes.DATE,
    deleted_on: DataTypes.DATE,
    deleted_by: DataTypes.INTEGER,
    created_on: {
      type: DataTypes.DATE,
    },
  }, {
    freezeTableName: true,
    timestamps: false
  });
  business_info.associate = function (models) {
    // associations can be defined here
    business_info.belongsTo(models.profile, {
      foreignKey: 'profile_id'
    })
  };
  return business_info;
};