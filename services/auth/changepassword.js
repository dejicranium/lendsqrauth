const models = require('mlar')('models');
const morx = require('morx');
const q = require('q');
const bcrypt = require('bcrypt');
const assert = require('mlar')('assertions');
const config = require('../../config');
const AuditLog = require('mlar')('audit_log');
const send_email = require('mlar').mreq('notifs', 'send');

const CHANGE_PASSWORD_EMAIL_CONTEXT_ID = 106;


/**
 * Change Password module
 * Implemented to update bank account
 * @module auth/changepassword
 *
 * @typdef {Object} ModulePayload
 * @property {string} current_password - old password
 * @property {string} new_password - new  password
 * @property {integer} confirm_password - repitition of new passord
 
 * @param {ModulePayload} data - The {@link ModulePayload} payload
 * @returns {Promise} -  confirmation text
 */



var spec = morx.spec({})
    .build('current_password', 'required:true, eg:somethingsweet')
    .build('new_password', 'required:true')
    .build('confirm_password', 'required:true')
    .end();

function service(data) {

    var d = q.defer();
    const globalUserId = data.USER_ID;

    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            params = validParameters.params;

            assert.mustBeValidPassword(data.new_password);

            if (params.confirm_password !== params.new_password)
                throw new Error("Passwords do not match")
            if (params.current_password === params.new_password)
                throw new Error("Current password cannot be the same as new password")

            if (params.new_password.length < 8) throw new Error("Password cannot be less than 8 characters");

            // get and hash password 
            return [params, models.user.findOne({
                where: {
                    id: globalUserId
                }
            }), bcrypt.hash(params.new_password, 10)];
        })
        .spread(async (params, user, generated_password) => {
            if (!user) throw new Error("Could not fetch user details")
            const oldPasswordIsAccurate = await bcrypt.compare(params.current_password, user.password);
            if (!oldPasswordIsAccurate) throw new Error("Current password is invalid/incorrect");
            if (!generated_password) throw new Error("Could not generate new password");

            user.password = generated_password;
            // save user and invalidate already existing token.
            await models.auth_token.destroy({
                where: {
                    type: 'session',
                    user_id: user.id
                }
            }, {
                force: true
            })

            return user.save();

        }).then(async (user) => {
            if (!user) throw new Error("An error occured while updating user's account");
            send_email(CHANGE_PASSWORD_EMAIL_CONTEXT_ID, user.email, {
                profileURL: config.base_url + '/'
            });

            let audit_log = new AuditLog(data.reqData, "UPDATE", 'changed their password');
            await audit_log.create();

            d.resolve("Successfully changed user's password");
        })
        .catch((err) => {
            console.log(err.stack);
            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;