'use strict';
module.exports = (sequelize, DataTypes) => {
  const audit_log = sequelize.define('audit_log', {
    action_type: DataTypes.STRING,
    actor_meta: DataTypes.TEXT,
    actor_id: DataTypes.INTEGER,
    action: DataTypes.TEXT,
    date:  {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date(),
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date(),
    }
  },  {
    timestamps: false,
    timestamp:false
  });

  audit_log.associate = function(models) {
    // associations can be defined here
    audit_log.belongsTo(models.user, {foreignKey: 'actor_id'})
  };
  return audit_log;
};