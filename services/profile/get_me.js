const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const paginate = require('mlar')('paginate');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;

var spec = morx.spec({})
    .end();

function service(data) {

    const d = q.defer();
    const filter = data.filter;

    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;

            return models.profile.findOne({
                where: {
                    id: data.profile.id
                },
                include: [{
                        model: models.user,
                        attributes: {
                            exclude: ['password', ...DEFAULT_EXCLUDES, 'business_name', 'active', 'deleted', 'disabled']

                        }
                    },
                    {
                        model: models.business_info,
                        attributes: {
                            exclude: DEFAULT_EXCLUDES
                        }
                    },
                    {
                        model: models.role,
                        attributes: ['name']
                    },
                    {
                        model: models.profile_contact,
                    },
                ],
                attributes: ['id', 'role_id', 'user_id', 'parent_profile_id']
            })
        })
        .then((profile) => {
            if (!profile) throw new Error("Profile not found")
            profile = JSON.parse(JSON.stringify(profile));

            let default_social_links = {
                facebook_link: profile.profile_contact.facebook_link,
                twitter_link: profile.profile_contact.twitter_link,
                instagram_link: profile.profile_contact.instagram_link,
                linkedin_link: profile.profile_contact.linkedin_link,
                youtube_link: profile.profile_contact.youtube_link
            }

            profile.profile_contact.social_links = default_social_links;

            delete profile.profile_contact.twitter_link
            delete profile.profile_contact.facebook_link
            delete profile.profile_contact.twitter_link
            delete profile.profile_contact.instagram_link
            delete profile.profile_contact.linkedin_link


            d.resolve(profile)
        })
        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;