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
const AuditLog = require('mlar')('audit_log');


var spec = morx.spec({})
    .build('user_id', 'required: true')
    .build('id', 'required: true')
    .end();

function service(data) {
    var d = q.defer();

    q.fcall(async () => {
            const validation = morx.validate(data, spec, {
                throw_error: true
            });
            params = validation.params;

            return [
                models.user_bank.findOne({
                    where: {
                        id: params.id,
                        user_id: params.user_id
                    }
                }),
                params
            ]
        })
        .spread(async (bankdetails, params) => {
            if (!bankdetails) throw new Error(`No such account exists for the user`);
            await bankdetails.update({
                delete_flag: 1,
                is_active: 0,
                is_default: 0,
                deleted_flag: 1,
                deleted_on: new Date(),
                deleted_by: params.user_id
            });

            let audit_log = new AuditLog(data.reqData, "DELETE", "deleted bank information");
            await audit_log.create();

            d.resolve(bankdetails);
        })
        .catch((err) => {
            d.reject(err);
        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;