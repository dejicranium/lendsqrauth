'use strict';
module.exports = (sequelize, DataTypes) => {
  const add_next_reminder_date_to_collections = sequelize.define('add_next_reminder_date_to_collections', {
    id: DataTypes.INTEGER
  }, {});
  add_next_reminder_date_to_collections.associate = function(models) {
    // associations can be defined here
  };
  return add_next_reminder_date_to_collections;
};