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
const getBanks = require('mlar')('getBanks');

var spec = morx.spec({})
    .build('user_id', 'required: true')
    .end();

function service(data) {
    var d = q.defer();


    // decide whether to default user_id to the user making the request or not
    // as we don't want people except admin viewing other people's bank details 

    q.fcall(async () => {
            const validation = morx.validate(data, spec, {
                throw_error: true
            });
            params = validation.params;
            let selection = {
                where: {
                    user_id: params.user_id,
                },
                attributes: [
                    'id',
                    'bvn',
                    'account_number',
                    'bank_code',
                    'is_default',
                    'is_active',
                    'user_id',
                    'created_on',
                    'deleted_flag'
                ]
            }

            if (params.active) selection.where.is_active = 1;
            if (params.disabled) selection.where.is_active = 0;
            if (params.deleted) selection.where.is_active = 0;

            return models.user_bank.findAll(selection)

        })
        .then(async (bankdetails) => {
            if (!bankdetails) throw new Error(`User has no accounts`);
            bankdetails = JSON.parse(JSON.stringify(bankdetails));
            let banks =  await getBanks();
            bankdetails.map(detail=> {
                if (banks && banks.length) {
                    banks.forEach(bank=>{
                        if (bank.additional_code == detail.bank_code){
                            detail.bank_logo = bank.url;
                            detail.bank_name = bank.code_description;
                            return detail;
                        }
                    })
                }
            })

            bankdetails = bankdetails.filter(detail => !detail.deleted_flag);
            d.resolve(bankdetails);
        })
        .catch((err) => {
            d.reject(err);
        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;