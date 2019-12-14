const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const paginate = require('mlar')('paginate');
const jwt = require('jsonwebtoken');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const config = require('../../config');

var spec = morx.spec({})
    .build('profile_id', 'required:true, eg:1')
    .end();

function service(data) {

    let globalUser = data.user;
    let d = q.defer();

    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;

            // check if user is the owner of the profile

            return models.profile.findOne({
                where: {
                    id: params.profile_id,
                    user_id: globalUser.id
                }
            })

        })
        .then(async (profile) => {
            if (!profile) throw new Error("User doesn't own this profile");
            // get permissions
            if (profile.status !== 'accepted' || profile.status !== null) {
                throw new Error("Profile has been set to inactive");
            }
            let permissions = await models.sequelize.query(`
        SELECT p.name as name from permissions as p INNER JOIN entity_permissions AS ep ON p.id = ep.permission_id WHERE  (ep.entity = 'role' AND ep.entity_id = ${profile.role_id} ) OR (ep.entity = 'profile' AND ep.entity_id = ${profile.id}) `)
            let role = await models.role.findOne({
                where: {
                    id: profile.role_id
                }
            })

            let user_permissions = [];

            if (permissions && permissions[0] && permissions[0]) {
                user_permissions = permissions[0].map(perm => perm.name);
            }


            let newToken = await jwt.sign({
                    id: profile.id,
                    parent_profile_id: profile.parent_profile_id,
                    email: globalUser.email,
                    user_id: globalUser.id,
                    role: role ? role.name : null,
                    permissions: user_permissions
                },
                config.JWTsecret, {
                    expiresIn: config.JWTexpiresIn
                }
            )

            // we need to create a profile token, 
            // first check whether one exists for a user 
            let profile_token = await models.auth_token.findOne({
                where: {
                    user_id: globalUser.id,
                    type: 'profile_token'
                }
            })

            if (profile_token && profile_token.user_id) {
                // update existing token
                let new_entry = await profile_token.update({
                    token: newToken,
                })
                if (new_entry.token) {
                    return {
                        token: new_entry.token
                    }
                } else {
                    return {
                        token: null
                    }
                }

            } else {
                // create a new one 
                return models.auth_token.create({
                    type: 'profile_token',
                    token: newToken,
                    user_id: globalUser.id,
                    is_used: 0
                })
            }

        })

        .then(tokenObject => {

            // token object is an object that shoudl contain `token` as a keuy
            if (tokenObject.token === null) {
                throw new Error("Could not create profile token");
            }

            d.resolve({
                profile_token: tokenObject.token
            });
        })

        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;