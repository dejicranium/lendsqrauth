'use strict';
module.exports = (sequelize, DataTypes) => {
  const add_website_link_to_business_info = sequelize.define('add_website_link_to_business_info', {
    id: DataTypes.INTEGER
  }, {});
  add_website_link_to_business_info.associate = function(models) {
    // associations can be defined here
  };
  return add_website_link_to_business_info;
};