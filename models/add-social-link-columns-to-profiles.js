'use strict';
module.exports = (sequelize, DataTypes) => {
  const add - social - link - columns - to - profiles = sequelize.define('add-social-link-columns-to-profiles', {
    facebook_link: DataTypes.STRING,
    twitter_link: DataTypes.STRING,
    instagram_link: DataTypes.STRING,
    linkedin_link: DataTypes.STRING,
    instagram_link: DataTypes.STRING
  }, {});
  add - social - link - columns - to - profiles.associate = function(models) {
    // associations can be defined here
  };
  return add - social - link - columns - to - profiles;
};