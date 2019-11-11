'use strict';
module.exports = (sequelize, DataTypes) => {
  const user_preference = sequelize.define('user_preference', {
    user_id: DataTypes.INTEGER,
    preference_id: DataTypes.INTEGER,
    preference_value: DataTypes.STRING,
    created_by: DataTypes.INTEGER,
    modified_on: DataTypes.DATE,
    modified_by: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
    created_on: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
  }, {
    timestamps: false
  });
  user_preference.associate = function(models) {
    // associations can be defined here
    user_preference.belongsTo(models.preference, {foreignKey: 'preference_id'} );
    user_preference.belongsTo(models.user, {foreignKey: 'user_id'} );
  };
  return user_preference;
};