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
const requests = require('mlar')('requests');


var spec = morx.spec({})
    .build('id', 'required: true')
    .build('account_number', 'required: false')
    .build('bank_code', 'required: false')
    .build('disable', 'required: false')
    .build('default', 'required: false')
    .build('active', 'required: false')
    .end();

function service(data) {
    var d = q.defer();

    q.fcall(async () => {
            const validation = morx.validate(data, spec, {
                throw_error: true
            });
            params = validation.params;
            if (params.active && params.disable) {
                throw new Error("You cannot disable and activate bank account at the same time");
            }

            if (params.default && params.disable) {
                throw new Error("You cannot disable account and set it as default")
            }
            return [
                models.user_bank.findOne({
                    where: {
                        id: params.id,
                        user_id: data.user.id
                    }
                }),
                params
            ]
        })
        .spread(async (bankdetails, params) => {
            if (!bankdetails) throw new Error(`No such account exists for the user`);

            // verify bank details if bank is available 
            if (params.account_number) {
                if (!params.bank_code) {
                    params.bank_code = bankdetails.bank_code
                }

                // verify bank details 
                await requests.verifyBank({
                    ...params
                }).then(resp => {
                    if (!resp) throw new Error("Bank account is not valid")
                }).catch(err => {
                    throw new Error("Bank account is invalid")
                })
            } else if (params.bank_code) {
                if (!params.account_number) {
                    params.account_number = bankdetails.account_number
                    // verify bank details 

                }
                await requests.verifyBank({
                    ...params
                }).then(resp => {
                    if (!resp) throw new Error("Bank account is not valid")
                }).catch(err => {
                    throw new Error("Bank account is invalid")
                })
            }



            if (params.disable) params.is_active = 0;
            if (params.active) params.is_active = 1;
            if (params.default) {
                // undo default for already existing default
                let defaultBankAccount = await models.user_bank.findOne({
                    where: {
                        user_id: params.user_id,
                        is_default: 1
                    }
                });
                if (defaultBankAccount && defaultBankAccount.id) {
                    await defaultBankAccount.update({
                        is_default: 0
                    })
                }

                params.is_default = 1;
            }
            bankdetails.update(params);

            d.resolve(bankdetails);
        })
        .catch((err) => {
            d.reject(err);
        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;