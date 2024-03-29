const models = require('mlar')('models');
const moment = require('moment');
const morx = require('morx');
const q = require('q');
const bcrypt = require('bcrypt');
const assert = require('mlar')('assertions');
const config = require('../../config');
const makeRequest = require('mlar')('makerequest');
const generateRandom = require('mlar')('testutils').generateRandom;
const requests = require('mlar')('requests');
const AuditLog = require('mlar')('audit_log');
const verifyAccountName = require('../../utils/bank').verifyAccountName
const getBVNVerificationData = require('../../utils/bank').getLocalBVNVerificationData;




/**
 * Add bank info module
 * Implemented to  add bank account
 * Handles otp verification too
 * @module auth/bankinfo.add
 *
 * @typdef {Object} ModulePayload
 * @property {integer} bvn - bank verification number
 * @property {string} account_number - account number to be added
 * @property {integer} bank_code - code of the bank to be added
 * @property {integer} otp - optional one timee password to verify
 * 
 * @param {ModulePayload} data - The {@link ModulePayload} payload
 * @returns {Promise} -  confirmation text
 */



var spec = morx.spec({})
    .build('bvn', 'required:true')
    .build('account_number', 'required:true')
    .build('bank_code', 'required:true')
    .build('otp', 'required:false')
    .end();

function service(data) {
    /* 
        Two stages.
        If there's no `otp`, we send OTP
        If there is, we verify OTP
    */
    var d = q.defer();
    const globalUserId = parseInt(data.user.id);
    const requestHeaders = {
        'Content-Type': 'application/json',
    };

    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });

            let params = validParameters.params;
            assert.bvnFormatOnly(params.bvn);
            assert.nubanFormatOnly(params.account_number);


            return [
                models.user_bank.findOne({
                    where: {
                        account_number: params.account_number,
                        //user_id: data.user.id

                    }
                }),
                models.user_bank.findOne({
                    where: {
                        bvn: params.bvn
                    }
                }),


                params,
            ]

        })
        .spread(async (record, bvnRecord, params) => {
            // throw error if record exists and it  is not deleted
            if (record && !record.deleted_flag) throw new Error("Account number already exists on this platform");

            // if bvn exists for a user other than the one making the request
            if (bvnRecord && parseInt(bvnRecord.user_id) !== parseInt(globalUserId)) {
                throw new Error("A different account is already associated with this BVN");
            }

            // verify bvn and send otp 
            if (!params.otp) {
                let url = config.utility_base_url + "verify/bvn";
                let payload = {
                    bvn: params.bvn
                };
                let verifiedBVN = await makeRequest(url, 'POST', payload, requestHeaders, 'verify BVN');
                let phoneNumberFromBVN = null;
                if (verifiedBVN && verifiedBVN.mobile) {
                    phoneNumberFromBVN = verifiedBVN.mobile;
                } else {
                    throw new Error("Could not verify BVN");
                }

                // store the fact that bvn has been verified 
                let verificationData = {
                    verified: 1,
                    bvn: params.bvn,
                    phone: verifiedBVN.mobile,
                    user_id: data.user.id
                }

                // verify bank details 
                await requests.verifyBank(params).then(resp => {
                    if (!resp) throw new Error("Bank account is invalid")
                    verificationData.account_name = resp.account_name;
                }).catch(err => {
                    throw new Error("Bank account is invalid")
                });


                await models.bvn_verifications.findOrCreate({
                        where: {
                            user_id: data.user.id,

                        },
                        defaults: verificationData
                    })
                    .spread(async (verification, created) => {
                        if (!created) {
                            verification.update(verificationData)
                        }
                    })


                // generate otp 
                let OTP = generateRandom('digits', 6);
                // create verify bank OTP
                //first check if there's one already;
                let token_create = await models.auth_token.findOrCreate({
                    where: {
                        type: 'verify_bank_otp',
                        user_id: globalUserId,
                    },
                    defaults: {
                        token: OTP,
                        type: 'verify_bank_otp',
                        user_id: globalUserId,
                        is_used: false,
                        expiry: moment(new Date()).add(10, 'minutes')
                    }
                });

                if (!token_create[1]) { // if token was not created, it exists , so go ahead and update
                    token_create[0].update({
                        token: OTP,
                        expiry: moment(new Date()).add(10, 'minutes'),
                        is_used: 0
                    })
                }

                // send otp to phone;
                url = config.notif_base_url + "sms/send";
                payload = {
                    recipient: phoneNumberFromBVN,
                    message: `Please use this OTP to complete your request on Lendsqr: ${OTP}. It expires in 10 minutes.`,
                    sender_id: 1
                }
                await makeRequest(url, 'POST', payload, requestHeaders, 'Verify BVN');

                return `OTP sent to phone`;
            }




            // if we only intend to verify otp otp
            else {

                let bvnverificationdata = await getBVNVerificationData(data.user.id, params.bvn);

                // set thee account name
                params.account_name = bvnverificationdata.account_name;

                let token = await models.auth_token.findOne({
                    where: {
                        type: 'verify_bank_otp',
                        user_id: globalUserId,
                        token: params.otp
                    }
                });
                if (!token || !token.id) throw new Error("Invalid OTP");
                if (token.token !== params.otp) throw new Error("Invalid OTP");
                else if (moment(new Date()).isAfter(token.expiry)) throw new Error("The token has expired");
                else if (token.is_used) throw new Error("Token is already used");

                // create account number;
                params.user_id = globalUserId;
                models.user_bank.create(params);
                // if token has no issues, show success and flag as used
                token.is_used = true;
                token.save();

                let audit_log = new AuditLog(data.reqData, "CREATE", "added a new bank account");
                audit_log.create();

                return "OTP verified";
            }
        })
        .then(success => {
            d.resolve(success)
        })

        .catch(err => {
            d.reject(err)
        })

    return d.promise;

}
service.morxspc = spec;
module.exports = service;