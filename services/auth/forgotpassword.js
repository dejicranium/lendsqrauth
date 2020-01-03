const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const bcrypt = require('bcrypt');
const validators = require('mlar')('validators');
const obval = require('mlar')('obval');
const assert = require('mlar')('assertions');
const crypto = require('crypto');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const moment = require('moment')
const config = require('../../config');
const makeRequest = require('mlar')('makerequest');
const AuditLog = require('mlar')('audit_log');
const send_email = require('mlar').mreq('notifs', 'send');

var spec = morx.spec({})
    .build('email', 'required:true, eg:itisdeji@gmail.com')

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
                },

            }), params]
        })
        .spread((user, params) => {
            if (!user) throw new Error(`User with email ${params.email} was not found`);

            //if (globalUserId !== user.id) throw new Error("You don't have access to this account");

            return [crypto.randomBytes(32).toString('hex'), user];

        }).spread((randomBytes, user) => {
            if (!randomBytes) throw new Error("An error occured while carrying out this operation");

            // for password reset, user_id will be the user email;
            return [
                models.auth_token.findOne({
                    where: {
                        type: 'password_reset',
                        user_id: user.id
                    }
                }),
                randomBytes,
                user
            ];

        }).spread((usertoken, token, user) => {

            // store as auth token and set expiry to 20 minutes from now
            let expiry = moment(new Date()).add(20, 'minutes');

            if (!usertoken)
                return [
                    models.auth_token.create({
                        type: 'password_reset',
                        user_id: user.id,
                        token: token,
                        expiry: expiry
                    }),
                    user
                ];

            return [
                usertoken.update({
                    token: token,
                    expiry: expiry,
                    is_used: 0
                }),
                user
            ];

        }).spread(async (tokencreated, user) => {
            if (!tokencreated) throw new Error("An error occured please try again");

            const fullname = user.business_name || user.first_name + ' ' + user.last_name;
            const link =  config.base_url + 'reset-password?token=' + tokencreated.token;
            const FORGOT_PASSWORD_EMAIL_CONTEXT_ID = 107;

            send_email(FORGOT_PASSWORD_EMAIL_CONTEXT_ID, user.email, {fullname, link});

            //send_email()
            /*const payload = {
                context_id: 80,
                sender: config.sender_email,
                recipient: user.email,
                sender_id: 1,
                data: {
                    email: user.email,
                    name: fullname,
                    url: config.base_url + 'reset-password?token=' + tokencreated.token,
                    token: tokencreated.token
                }
            }
            const url = config.notif_base_url + "email/send";
            const requestHeaders = {
                'Content-Type': 'application/json'
            }
            try {
                await makeRequest(url, 'POST', payload, requestHeaders);

            } catch (e) {
                // silent treatements
            }(*/


            // create audit log;
            let audit_log = new AuditLog(data.reqData, "UPDATE", 'requested for a password reset');
            await audit_log.create();

            d.resolve(tokencreated.token);
        })
        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;