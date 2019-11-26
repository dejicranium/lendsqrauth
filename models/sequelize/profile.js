'use strict';
module.exports = (sequelize, DataTypes) => {
  const profile = sequelize.define('profile', {
    role_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    created_on: {
      type: DataTypes.DATE,
    },
    parent_profile_id: DataTypes.INTEGER,
    deleted_flag: DataTypes.BOOLEAN,
    created_by: DataTypes.INTEGER,
    modified_on: DataTypes.DATE,
    modified_by: DataTypes.DATE,
    deleted_on: DataTypes.DATE,
    deleted_by: DataTypes.INTEGER,
  }, {
    timestamps: false,
  });
  profile.associate = function(models) {
    // associations can be defined here
    profile.belongsTo(models.profile, {foreignKey: 'parent_profile_id', as: 'sub_profiles'});    
    profile.belongsTo(models.user, {foreignKey: 'user_id'});
    profile.belongsTo(models.role, {foreignKey: 'role_id'})
    profile.hasOne(models.profile_contact, {foreignKey: 'profile_id'});
    profile.hasMany(models.collection, {foreignKey: 'lender_id'});
    profile.hasMany(models.collection, {foreignKey: 'borrower_id'});
    profile.hasMany(models.collection_payment_requests, {foreignKey: 'borrower_id'});
    profile.hasOne(models.business_info, {foreignKey: 'profile_id'})
  };
  return profile;
};