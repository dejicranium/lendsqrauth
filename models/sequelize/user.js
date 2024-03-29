'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    uuid: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    image: DataTypes.STRING,
    business_name: DataTypes.STRING,
    status_reason: DataTypes.TEXT,

    deleted: DataTypes.BOOLEAN,
    password: DataTypes.STRING,
    created_on: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
    status: DataTypes.STRING,
    created_by: DataTypes.INTEGER,
    modified_on: DataTypes.DATE,
    modified_by: DataTypes.DATE,
    deleted_on: DataTypes.DATE,
    deleted_by: DataTypes.INTEGER,

  }, {
    timestamps: false

  });
  user.associate = function (models) {
    // associations can be defined here
    //user.hasMany(models.role, {foreignKey: 'user_id'})
    user.hasMany(models.profile, {
      foreignKey: 'user_id'
    });

    user.hasMany(models.audit_log, {
      foreignKey: 'actor_id'
    })
  };
  return user;
};