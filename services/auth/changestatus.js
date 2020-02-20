const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const bcrypt = require('bcrypt');
const validators = require('mlar')('validators');
const obval = require('mlar')('obval');
const assert = require('mlar')('assertions');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const AuditLog = require('mlar')('audit_log');

var spec = morx.spec({})
    .build('user_id', 'required:true') // to be used by admin
    .build('status', 'required:true')
    .build('reason', 'required:false')
    .end();

function service(data) {

    var d = q.defer();

    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;



            return [models.user.findOne({
                where: {
                    id: params.user_id
                }
            }), params]
        })
        .spread((user, params) => {
            if (!user) throw new Error("User does not exist");
            if (params.status == 'activate' && user.status == 'active') throw new Error("User is already active");
            if (params.status == 'deactivate' && user.status == 'deactivated') throw new Error("User is already deactivated");

            let updateParams = {};
            if (params.status == 'deactivate') {
                updateParams.status = 'deactivated';
            } else if (params.status == 'activate') {
                updateParams.status = 'active'
            }
            updateParams.status_reason = params.reason

            return user.update(updateParams)

        }).then((user) => {
            if (!user) throw new Error("An error occured while updating user's account");
            let action_type = data.status === "activate" ? 'activated' : 'deactivated';
            let audit_log = new AuditLog(data.reqData, "UPDATE", action_type + " account with user id " + user.id);
            audit_log.create();
            d.resolve("Successfully updated user's status");
        })
        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;