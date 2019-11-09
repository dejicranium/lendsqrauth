'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    business_name: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    disabled: DataTypes.BOOLEAN,
    deleted: DataTypes.BOOLEAN,
    password: DataTypes.STRING,
    password: DataTypes.STRING,
    created_on: DataTypes.DATE,
    created_by: DataTypes.INTEGER,
    modified_on: DataTypes.DATE,
    modified_by: DataTypes.DATE,
    deleted_on: DataTypes.DATE,
    deleted_by: DataTypes.INTEGER,
    
  }, {
    timestamps: false

  });
  user.associate = function(models) {
    // associations can be defined here
    user.hasMany(models.user_role, {foreignKey: 'user_id'})
    user.hasMany(models.profile, {foreignKey: 'user_id'})
  };
  return user;
};