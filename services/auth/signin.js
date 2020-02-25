const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const bcrypt = require('bcrypt');
const validators = require('mlar')('validators');
const obval = require('mlar')('obval');
const assert = require('mlar')('assertions');
const jwt = require('jsonwebtoken');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const config = require('../../config');
const jwt_decode = require('jwt-decode');
const AuditLog = require('mlar')('audit_log');


var spec = morx.spec({})
    .build('password', 'required:true, eg:tinatona98')
    .build('email', 'required:true, eg:tinaton@gmail.com')
    .end();

function service(data) {

    var d = q.defer();
    q.fcall(async () => {
            var validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            let params = validParameters.params;

            assert.emailFormatOnly(params.email); // validate email, throw error if it's some weird stuff
            return [models.user.findOne({
                where: {
                    email: params.email
                }
            }), params]
        })
        .spread(async (user, params) => {
            if (!user) throw new Error("Invalid credential(s)");

            // make sure that user doesn't have just one profile and that profile is an admin
            let user_profiles = await models.profile.findAll({
                where: {
                    user_id: user.id
                }
            });
            let admin_role = await models.role.findOne({
                where: {
                    name: 'admin'
                }
            });
            if (user_profiles.length === 1 && parseInt(user_profiles[0].role_id) === parseInt(admin_role.id)) {
                throw new Error("Cannot sign in user with only one profile which is an admin profile")
            }

            // deciper password 
            return [user, bcrypt.compare(params.password, user.password), user_profiles]

        }).spread((user, password, user_profiles) => {
            if (!password) throw new Error("Invalid credential(s)");
            return [user, models.auth_token.findOne({
                where: {
                    type: 'session',
                    user_id: user.id
                }
            }), user_profiles]


        })
        .spread(async (user, token, user_profiles) => {
            if (user.status !== 'active') throw new Error('User is inactive');

            // ids of the user's profiles 
            user_profiles = user_profiles.map(profile => profile.id);

            let newToken = await jwt.sign({
                    profiles: user_profiles,
                    email: user.email,
                    user_id: user.id,
                    subtype: user.subtype
                },
                config.JWTsecret, {
                    expiresIn: config.JWTexpiresIn
                })

            if (!token) {
                // create and store token
                return [user,
                    models.auth_token.create({
                        type: 'session',
                        token: newToken,
                        user_id: user.id,
                    })
                ]

            }
            return [user,
                token.update({
                    token: newToken,
                    is_used: 0
                })
            ]


        }).spread(async (user, token) => {
            if (!token) throw new Error(token) //throw new Error("Could not create new token");


            let fields = "id,first_name,last_name,phone,email,image,type".split(',')
            let response = {};


            user = obval.select(fields).from(user);


            response.user = user;
            response.token = token.token;


            data.reqData.user = user;
            let audit_log = new AuditLog(data.reqData, 'LOGIN', 'logged into their account');
            await audit_log.create();


            d.resolve(response)
        })
        .catch((err) => {
            //console.log(err.stack)
            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;