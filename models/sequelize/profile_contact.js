'use strict';
module.exports = (sequelize, DataTypes) => {
  const profile_contact = sequelize.define('profile_contact', {
    profile_id: DataTypes.INTEGER,
    contact_first_name: DataTypes.STRING,
    contact_last_name: DataTypes.STRING,
    contact_phone: DataTypes.STRING,
    contact_email: DataTypes.STRING,
    support_email: DataTypes.STRING,
    contact_role: DataTypes.STRING,
    created_on: DataTypes.DATE,
    created_by: DataTypes.INTEGER,
    modified_on: DataTypes.DATE,
    modified_by: DataTypes.DATE,
    deleted_on: DataTypes.DATE,
    deleted_by: DataTypes.INTEGER,
  }, {
    timestamps: false,
  });
  profile_contact.associate = function(models) {
    // associations can be defined here
    profile_contact.belongsTo(models.profile, {foreignKey: 'profile_id'})
  };
  return profile_contact;
};