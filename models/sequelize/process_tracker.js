'use strict';
module.exports = (sequelize, DataTypes) => {
  const process_tracker = sequelize.define('process_tracker', {
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    latest_stop_id: DataTypes.INTEGER,
    latest_date: DataTypes.DATE
  }, {});
  process_tracker.associate = function (models) {
    // associations can be defined here
  };
  return process_tracker;
};