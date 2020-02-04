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
const moment = require('moment');
const config = require('../../config');
const makeRequest = require('mlar')('makerequest');
const generateRandom = require('mlar')('testutils').generateRandom;
const AuditLog = require('mlar')('audit_log');
const send_email = require('mlar').mreq('notifs', 'send');
const userIsRegistered = require('../../utils/user').isRegisteredUser;
const profileUtil = require('../../utils/profiles');

var spec = morx.spec({})
    .build('email', 'required:false')
    .build('phone', 'required:false')
    .build('type', 'required:true')
    .build('subtype', 'required:true')
    .build('user_id', 'required:false')
    .build('email', 'required:false')
    .end();

function service(data) {

    var d = q.defer();
    let globalUserId = '';

    q.fcall(async () => {
            var validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            let params = validParameters.params;

            if (params.type !== 'otp' && params.type !== 'token') {
                throw new Error("Type can be `otp` or `token` only");
            }

            if (!['verify_bank_otp', 'resend_invitation'].includes(params.subtype)) {
                throw new Error("Subtype should be `verify_bank_otp` or `resend_invitation`");
            }
            if (params.email) {
                assert.emailFormatOnly(params.email);
            }
            if (params.subtype == 'verify_bank_otp' && !params.phone) throw new Error("You must provide a phone");
            if (params.subtype == 'resend_invitation' && !params.email) throw new Error("You must provide an email");

            // make sure the type and subtype pair are correct
            if (params.type != 'otp' && params.subtype == 'verify_bank_otp') {
                throw new Error("Type for `verify_bank_otp` should be `otp`")
            }

            const requestHeaders = {
                'Content-Type': 'application/json',
            }

            if (params.type == 'otp') {
                let OTP = generateRandom('digits', 6);

                let token_create = await models.auth_token.findOrCreate({
                    where: {
                        type: 'verify_bank_otp',
                        user_id: data.user.id,
                    },
                    defaults: {
                        token: OTP,
                        type: 'verify_bank_otp',
                        user_id: data.user.id,
                        is_used: false,
                        expiry: moment(new Date()).add(10, 'minutes')
                    }
                })
                if (!token_create[1]) { // if token was not created, it exists , so go ahead and update
                    token_create[0].update({
                        token: OTP,
                        expiry: moment(new Date()).add(20, 'minutes'),
                        is_used: 0
                    })
                }

                let url = config.notif_base_url + "sms/send"; // notification servicer
                let payload = {
                    recipient: params.phone,
                    message: `Your OTP is ${OTP}`,
                    sender_id: 1
                }

                // send otp to phone;
                return makeRequest(url, 'POST', payload, requestHeaders);

            } else {
                // send email 

                if (params.type === 'token' && params.subtype === 'resend_invitation') {

                    let user_invite = await models.user_invites.findOne({
                        where: {
                            inviter: data.profile.id,
                            invitee: params.email
                        }
                    })

                    let INVITATION_EMAIL_CONTEXT_ID = 93;



                    if (!user_invite || !user_invite.id)
                        throw new Error("You haven't invited user with email: " + params.email);
                    if (['accepted'].includes(user_invite.status))
                        throw new Error("Invitation already " + user_invite.status);
                    const emailPayload = {
                        //userName: GLOBAL_USER ? GLOBAL_USER.first_name + ' ' + GLOBAL_USER.last_name || GLOBAL_USER.business_name || '' : created1.first_name + ' ' + created1.last_name || created1.business_name || '', // existing team member
                        lenderFullName: data.user.first_name ? data.user.first_name + ' ' + data.user.last_name : data.user.business_name,
                        lenderName: data.user.first_name ? data.user.first_name + ' ' + data.user.last_name : data.user.business_name,
                        memberAcceptURL: "",
                        memberDeclineURL: config.base_url + 'team/reject?token=' + user_invite.token
                    }

                    if (user_invite.user_created_id) {
                        let {
                            user,
                            exists
                        } = await userIsRegistered(user_invite.user_created_id);


                        let token = await crypto.randomBytes(32).toString('hex');
                        await user_invite.update({
                            token
                        })

                        let recipient = user.email;
                        emailPayload.userName = user.first_name ? user.first_name + ' ' + user.last_name : '';

                        if (!exists) {
                            INVITATION_EMAIL_CONTEXT_ID = 94;
                            emailPayload.memberAcceptURL = config.base_url + 'signup/team?token=' + token
                        } else {
                            emailPayload.memberAcceptURL = config.base_url + 'team/accept?token=' + token
                            if (!emailPayload.userName) {
                                INVITATION_EMAIL_CONTEXT_ID = 94;
                                emailPayload.memberAcceptURL = config.base_url + 'signup/team?token=' + token
                            }

                        }

                        await user_invite.update({
                            status: 'pending'
                        })
                        return send_email(INVITATION_EMAIL_CONTEXT_ID, recipient, emailPayload);

                    }



                }
            }
        })
        .then(async (auth_token) => {
            if (!auth_token) throw new Error("Could not resend token");

            let audit_log = new AuditLog(data.reqData, "CREATE", "requested for a token to be resent");
            await audit_log.create();

            d.resolve(auth_token);

        })
        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;