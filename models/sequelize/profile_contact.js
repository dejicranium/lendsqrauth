'use strict';
module.exports = (sequelize, DataTypes) => {
  const profile_contact = sequelize.define('profile_contact', {
    profile_id: DataTypes.INTEGER,
    contact_name: DataTypes.STRING,
    contact_phone: DataTypes.STRING,
    contact_email: DataTypes.STRING,
    support_email: DataTypes.STRING,
    facebook_link: DataTypes.STRING,
    twitter_link: DataTypes.STRING,
    instagram_link: DataTypes.STRING,
    linkedin_link: DataTypes.STRING,
    contact_role: DataTypes.STRING,
    created_on: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
    },
    created_by: DataTypes.INTEGER,
    modified_on: DataTypes.DATE,
    modified_by: DataTypes.DATE,
    deleted_on: DataTypes.DATE,
    deleted_by: DataTypes.INTEGER,
  }, {
    timestamps: false,
  });
  profile_contact.associate = function (models) {
    // associations can be defined here
    profile_contact.belongsTo(models.profile, {
      foreignKey: 'profile_id'
    })
  };
  return profile_contact;
};
'use strict';