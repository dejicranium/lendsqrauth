'use strict';
module.exports = (sequelize, DataTypes) => {
  const collection_init_state = sequelize.define('collection_init_state', {
    collection_id: DataTypes.INTEGER,
    state: DataTypes.TEXT
  }, {

  });
  collection_init_state.associate = function (models) {
    // associations can be defined here

  };
  return collection_init_state;
};