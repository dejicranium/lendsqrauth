const models = require('mlar')('models');
const morx = require('morx');
const q = require('q');
const AuditLog = require('mlar')('audit_log');

/**
 * Change status module
 * Implemented to update user status
 * @module auth/changestatu
 *
 * @typdef {Object} ModulePayload
 * @property {integer} user_id - id of user
 * @property {string} status - new status
 * @property {reason} confirm_password - reason for changing status
 
 * @param {ModulePayload} data - The {@link ModulePayload} payload
 * @returns {Promise} -  confirmation text
 */


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