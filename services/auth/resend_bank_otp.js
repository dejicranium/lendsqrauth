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

var spec = morx.spec({})

    .end();

function service(data) {

    var d = q.defer();


    q.fcall(async () => {
            var validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            let params = validParameters.params;

            return models.bvn_verifications.findOne({
                where: {
                    user_id: data.user.id,
                }
            })
        })
        .then(async (verification) => {
            if (!verification) throw new Error("User has never attempted an adding a bank account");

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
                    expiry: moment(new Date()).add(10, 'minutes'),
                    is_used: 0
                })
            }

            let url = config.notif_base_url + "sms/send"; // notification servicer

            let payload = {
                recipient: verification.phone,
                message: `Your verification OTP is ${OTP} and it lasts 10 minutes`,
                sender_id: 1
            }

            const requestHeaders = {
                'Content-Type': 'application/json',
            }

            // send otp to phone;
            await makeRequest(url, 'POST', payload, requestHeaders);


            let audit_log = new AuditLog(data.reqData, "CREATE", "requested bank verification OTP to be sent");
            await audit_log.create();

            d.resolve("Sent otp");
        })
        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;