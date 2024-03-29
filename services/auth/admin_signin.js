const models = require('mlar')('models');
const morx = require('morx');
const q = require('q');
const obval = require('mlar')('obval');
const assert = require('mlar')('assertions');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const AuditLog = require('mlar')('audit_log');
const moment = require('moment');

/**
 * Admin sign in module
 * Implemented to sign in admin. Uses google auth. 
 * Automatically creates a user account and assigns and admin role
 * if request is coming from a lendsqr email domain
 * @module auth/admin_siginin
 *
 * @typdef {Object} ModulePayload
 * @property {string} email - email trying to login
 * @property {string} idToken - idToken from google auth; passed from the frontend
 * @property {string} provider - provider from google auth; passed from the frontend.
 * 
 * @param {ModulePayload} data - The {@link ModulePayload} payload
 * @returns {Promise} -  user details, access and profile token
 */

var spec = morx.spec({})
    //.build('password', 'required:true, eg:tinatona98')
    .build('email', 'required:true, eg:tinaton@gmail.com')
    .build('idToken', 'required:true, eg:tinaton@gmail.com')
    .build('provider', 'required:true, eg:tinaton@gmail.com')

    .end();

function service(data) {
    let admin_role = null;
    var d = q.defer();
    q.fcall(async () => {
        var validParameters = morx.validate(data, spec, {
            throw_error: true
        });
        let params = validParameters.params;

        assert.emailFormatOnly(params.email); // validate email, throw error if it's some weird stuff

        if (params.provider.toUpperCase() !== 'GOOGLE') throw new Error("Could not login user");
        if (params.email.indexOf("lendsqr.com") < 0) throw new Error("3. Invalid admin credentials");
        const jwt_decode = require('jwt-decode');
        let idToken = jwt_decode(params.idToken);

        if (idToken.hd !== 'lendsqr.com') throw new Error("2. Invalid admin credentials");
        if (!idToken.email_verified) throw new Error("1. Invalid admin credentials");

        params.first_name = idToken.given_name;
        params.last_name = idToken.family_name;
        params.status = 'active';

        return [models.user.findOne({
            where: {
                email: params.email
            }
        }), params]
    })
        .spread(async (user, params) => {
            admin_role = await models.role.findOne({
                where: {
                    name: 'admin'
                }
            });

            if (!user) {

                // create a new user with profile admin
                return models.sequelize.transaction((t1) => {
                    // create a user and his profile
                    return q.all([
                        models.user.create(params, {
                            transaction: t1
                        }),
                        models.profile.create({
                            role_id: admin_role.id,
                            created_on: new Date()
                        }, {
                            transaction: t1
                        })
                    ]);
                })
            } else {
                // for development, update last name -- temporary stuff
                if (!user.last_name) {
                    user.last_name = params.last_name;
                    await user.save();
                }
                return [user, models.profile.findOne({
                    where: {
                        user_id: user.id,
                        role_id: admin_role.id
                    }
                })]
            }
        })
        .spread(async (user, profile) => {
            if (!profile) {
                // creatone // 

                profile = await models.profile.create({
                    role_id: admin_role.id,
                    created_on: new Date()
                })
            } else if (!profile.user_id) {
                profile.user_id = user.id;
                await profile.save();
            }
            let permissions = await models.sequelize.query(`
            SELECT p.name as name from permissions as p INNER JOIN entity_permissions AS ep ON p.id = ep.permission_id WHERE  (ep.entity = 'role' AND ep.entity_id = ${profile.role_id} ) OR (ep.entity = 'profile' AND ep.entity_id = ${profile.id}) `)


            let user_permissions = [];

            if (permissions && permissions[0] && permissions[0]) {
                user_permissions = permissions[0].map(perm => perm.name);
            }

            let newToken = await jwt.sign({
                id: profile.id,
                parent_profile_id: profile.parent_profile_id,
                email: user.email,
                user_id: user.id,
                role: 'admin',
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
                    user_id: user.id,
                    type: 'profile_token'
                }
            })

            if (profile_token && profile_token.user_id) {
                // update existing token
                await profile_token.update({
                    token: newToken,
                })

            } else {
                // create a new one 
                await models.auth_token.create({
                    type: 'profile_token',
                    token: newToken,
                    user_id: user.id,
                    is_used: 0
                })
            }
            return [user, profile_token, models.auth_token.findOne({
                where: {
                    type: 'session',
                    user_id: user.id
                }
            })]
        })
        .spread(async (user, profile_token, token) => {
            if (user.status !== 'active') throw new Error("User is inactive");
            let user_profiles = await models.profile.findAll({
                where: {
                    user_id: user.id
                }
            })
            user_profiles = user_profiles.map(profile => profile.id)

            let newToken = await jwt.sign({
                profiles: user_profiles,
                email: user.email,
                user_id: user.id,
                subtype: user.subtype
            }, config.JWTsecret, {
                expiresIn: config.JWTexpiresIn
            })

            if (!token || moment().isBefore(token.expiry)) {
                // create and store token
                return [user, profile_token, models.auth_token.create({
                    type: 'session',
                    token: newToken,
                    user_id: user.id,
                })]

            }
            return [
                user, profile_token, token
            ]


        }).spread(async (user, profile_token, token) => {
            if (!token) throw new Error("Could not create new token");
            let fields = "id,first_name,last_name,phone,email,business_name,active,deleted,disabled,type,subtype".split(',')

            let response = {};
            user = obval.select(fields).from(user);

            data.reqData.user = JSON.parse(JSON.stringify(user));
            let audit_log = new AuditLog(data.reqData, 'LOGIN', "logged into admin account");
            await audit_log.create();

            response.user = user;
            response.access_token = token.token;
            response.profile_token = profile_token.token
            d.resolve(response)
        })
        .catch((err) => {
            console.log(err);
            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;