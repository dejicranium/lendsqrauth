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
                    deleted_flag: {
                        $ne: 1
                    }
                },
                attributes: [
                    'id',
                    'bvn',
                    'account_number',
                    'bank_code',
                    'is_default',
                    'is_active',
                    'user_id',
                    'created_on'
                ]
            }

            if (params.active) selection.where.is_active = 1;
            if (params.disabled) selection.where.is_active = 0;
            if (params.deleted) selection.where.is_active = 1;

            return models.user_bank.findAll(selection)

        })
        .then((bankdetails) => {
            if (!bankdetails) throw new Error(`User has no accounts`);
            d.resolve(bankdetails);
        })
        .catch((err) => {
            d.reject(err);
        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;