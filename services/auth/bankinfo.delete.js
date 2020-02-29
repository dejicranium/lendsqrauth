const models = require('mlar')('models');
const morx = require('morx');
const q = require('q');
const AuditLog = require('mlar')('audit_log');


/**
 * Delete bank info module
 * Implemented to soft delete bank account
 * @module auth/bankinfo.delete
 *
 * @typdef {Object} ModulePayload
 * @property {string} user_id - id of user
 * @property {string} id - id of bank record to delete

 * @param {ModulePayload} data - The {@link ModulePayload} payload
 * @returns {Promise} -  bank details that was soft deleted
 */


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
                deleted_flag: 1,
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