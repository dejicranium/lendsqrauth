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
    const globalUserId = data.user_id;
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
                        user_id: data.user.id

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
            if (record && !record.deleted_flag) throw new Error("Account number already exists for this user");

            // if bvn exists for a user other than the one making the request
            if (bvnRecord && bvnRecord.user_id != parseInt(globalUserId)) {
                throw new Error("A different account is already associated with this BVN");
            }


            // verify bvn and send otp 
            if (!params.otp) {

                let url = config.utility_base_url + "verify/bvn";

                let payload = {
                    bvn: params.bvn
                };

                let phoneNumberFromBVN = null;

                let verifiedBVN = await makeRequest(url, 'POST', payload, requestHeaders, 'verify BVN');

                if (verifiedBVN && verifiedBVN.mobile) {
                    phoneNumberFromBVN = verifiedBVN.mobile;
                } else {
                    throw new Error("Could not verify BVN");
                }


                // store the fact that bvn has been berified 
                let verificationData = {
                    verified: 1,
                    bvn: params.bvn,
                    phone: verifiedBVN.mobile,
                    user_id: data.user.id
                }

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


                // verify bank details 
                await requests.verifyBank({
                    ...params
                }).then(resp => {
                    if (!resp) throw new Error("Bank account is not valid")
                }).catch(err => {
                    throw new Error("Bank account is invalid")
                });

                //if all successful ---

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
                        expiry: moment(new Date()).add(20, 'minutes'),
                        is_used: 0
                    })
                }

                // send otp to phone;
                url = config.notif_base_url + "sms/send";
                payload = {
                    recipient: phoneNumberFromBVN,
                    message: `Your OTP is ${OTP}`,
                    sender_id: 1
                }
                await makeRequest(url, 'POST', payload, requestHeaders, 'Verify BVN');

                return `Phone number is: ${phoneNumberFromBVN}`;
            }

            // if we only intend to verify otp otp
            else {
                let token = await models.auth_token.findOne({
                    where: {
                        type: 'verify_bank_otp',
                        user_id: globalUserId,
                    }
                })
                if (!token && !token.id) throw new Error("Invalid OTP");
                else if (moment(new Date()).isAfter(token.expiry)) throw new Error("The token has expired");
                else if (token.is_used) throw new Error("Token is already used");

                // create account number;
                params.user_id = globalUserId;
                await models.user_bank.create({
                    ...params
                });

                // if token has no issues, show success and flag as used
                token.is_used = true;
                await token.save();
                return "OTP verified";
            }


        })
        .then(success => {
            if (!success) throw new Error("An error occurred while carrying out this operation")


            d.resolve(success);
        })
        .catch(err => {
            d.reject(err)
        })

    return d.promise;

}
service.morxspc = spec;
module.exports = service;