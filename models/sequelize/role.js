'use strict';
module.exports = (sequelize, DataTypes) => {
  const role = sequelize.define(
    'role',
    {
      name: DataTypes.STRING,
      deleted_flag: DataTypes.BOOLEAN,
      created_on: DataTypes.DATE,
      created_by: DataTypes.INTEGER,
      modified_on: DataTypes.DATE,
      modified_by: DataTypes.DATE,
      deleted_on: DataTypes.DATE,
      deleted_by: DataTypes.INTEGER
    },
    {
      timestamps: false
    }
  );
  role.associate = function(models) {
    role.hasMany(models.profile, { foreignKey: 'role_id' });
  };
  return role;
};
