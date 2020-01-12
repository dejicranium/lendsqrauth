'use strict';
module.exports = (sequelize, DataTypes) => {
  const add_reminder_sent_column = sequelize.define('add_reminder_sent_column', {
    id: DataTypes.INTEGER
  }, {});
  add_reminder_sent_column.associate = function(models) {
    // associations can be defined here
  };
  return add_reminder_sent_column;
};