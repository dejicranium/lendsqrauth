'use strict';
module.exports = (sequelize, DataTypes) => {
  const create_tenor_type_table = sequelize.define('create_tenor_type_table', {
    id: DataTypes.INTEGER
  }, {});
  create_tenor_type_table.associate = function(models) {
    // associations can be defined here
  };
  return create_tenor_type_table;
};