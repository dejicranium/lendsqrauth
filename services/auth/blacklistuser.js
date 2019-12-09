const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const bcrypt = require('bcrypt');
const validators = require('mlar')('validators');
const obval = require('mlar')('obval');
const assert = require('mlar')('assertions');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;

var spec = morx.spec({})
    .build('user_id', 'required:true') // to be used by admin
    .build('reason', 'required:false') // to be used by admin
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
            let updateData = {
                status: 'blacklisted'
            }
            if (params.reason) {
                updateData.status_reason = params.reason
            }
            return user.update(updateData);

        }).then((user) => {
            if (!user) throw new Error("An error occured while updating user's account");

            d.resolve("Successfully updated user's status");
        })
        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;