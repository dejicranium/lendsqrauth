const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const signup = require('mlar')('signupservice');
const bcrypt = require('bcrypt');
const config = require('../../config');
const makeRequest = require('mlar')('makerequest');
const crypto = require('crypto');
const AuditLog = require('mlar')('audit_log');
const send_email = require('mlar').mreq('notifs', 'send');


/**  this is to be used by a borrower to reject a collections invitation 
 *  sent to him by a lender.
 * 
 * The Lenderr should be notified about the outcome
 *   x
 */
var spec = morx.spec({})
    .build('token', 'required:true')
    .build('first_name', 'required:true')
    .build('last_name', 'required:true')
    .build('password', 'required:true')
    .build('password_confirmation', 'required:true')
    .build('phone', 'required:true')
    .end();


// TODO: make type borrower
// TODO: 
function service(data) {
    var d = q.defer();
    const requestHeaders = {
        'Content-Type': 'application/json',
    }
    const globalUserId = data.USER_ID || 1;
    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;

            if (validators.areMutuallyExclusive([params.password, params.password_confirmation]))
                throw new Error("Passwords do not match");

            if (params.password.length < 8)
                throw new Error("Password cannot be less than 8 characters");


            if (params.first_name && params.first_name.length < 3) {
                throw new Error("Name cannot be less than 3 characters")
            }
            if (params.last_name && params.last_name.length < 3) {
                throw new Error("Name cannot be less than 3 characters")
            }

            try {

                // make request to verify phone number
                const verifiedPhone = await makeRequest(
                    config.utility_base_url + 'verify/phone/',
                    'POST', {
                        phone: params.phone
                    },
                    requestHeaders,
                    'validate phone number'
                )


                if (verifiedPhone) {
                    if (verifiedPhone.phone == undefined && verifiedPhone.countryCode == undefined) throw new Error("Phone number not valid");
                }
                if (verifiedPhone.status == 'error') {
                    throw new Error("Could not validate phone number");
                }
            } catch (e) {
                throw new Error("Error while validating phone number")
            }




            // verify the token from the invites table
            return models.user_invites.findOne({
                where: {
                    token: params.token
                }
            })
        })
        .then((invite) => {

            if (!invite) throw new Error("Invitation token invalid");
            if (invite.status !== 'pending') throw new Error("Token already used");

            //prepare to update the user that was created during the inviation
            return [models.user.findOne({
                where: {
                    id: invite.user_created_id
                }
            }), invite]
        })
        .spread(async (user, invite) => {

            if (!user) throw new Error("Could not create a user");


            // add a parent_profile when it's accepted
            let accepted_user_profile = await models.profile.findOne({
                where: {
                    id: invite.profile_created_id
                }
            })

            if (accepted_user_profile && accepted_user_profile.id) {
                // add a parent_profile when it's accepted
                accepted_user_profile.parent_profile_id = invite.inviter;
                await accepted_user_profile.save()
            }



            // update the invitation
            await invite.update({
                status: 'accepted'
            })
            data.password = await bcrypt.hash(data.password, 10);

            return user.update(data);



        })

        .then(async user => {
            if (!user) throw new Error("Could not create user");

            // create wallet
            let createWallet = require('../../utils/wallet').create;
            await createWallet(user);

            // create activation token
            const userToken = await crypto.randomBytes(32).toString('hex');

            const token = await models.auth_token.findOrCreate({
                where: {
                    user_id: user.id,
                    type: 'user_activation'
                },
                defaults: {
                    user_id: user.id,
                    type: 'user_activation',
                    token: userToken,
                    is_used: 0,
                }
            });

            // if token type already existed for user
            if (!token[1]) {
                // update token record  - no two tokens of the same type for a user
                await token[0].update({
                    token: userToken,
                    is_used: 0
                });
            }

            let fullname = user.business_name || user.first_name + ' ' + user.last_name;



            try {
                //await makeRequest(url, 'POST', payload, requestHeaders);
                let welcome_email_context_id = 108;

                await send_email(welcome_email_context_id, user.email, {
                    lenderFullName: fullname,
                    loginURL: config.base_url + 'login'
                });

            } catch (e) {
                //console.log("got to error")
                // require('mlar')('locallogger').error(data.reqData, {}, e);

            }


            data.reqData.user = JSON.parse(JSON.stringify(user));
            let audit_log = new AuditLog(data.reqData, 'SIGN UP', 'completed registration as a team member');
            audit_log.create();
            d.resolve(user);
        })

        .catch(err => {
            ////console.log(err.stack)
            /*require('mlar')('locallogger').error({
                body: data
            }, {}, error);*/
            //let log = require('mlar')('locallogger');
            //log.error(err)
            d.reject(err)


        })


    return d.promise;

}
service.morxspc = spec;
module.exports = service;