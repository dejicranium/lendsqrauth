const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const AuditLog = require('mlar')('audit_log');

var spec = morx.spec({})
    .build('profile_id', 'required:true, eg:lender')
    .build('status', 'required:false, eg:lender')
    .end();

function service(data) {

    var d = q.defer();

    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;


            const statuses = ['active', 'inactive', 'blacklisted', 'deactivated'];
            if (!statuses.includes(params.status)) {
                throw new Error("Status should be one of " + statuses.join(', '));
            }
            return models.profile.findOne({
                where: {
                    id: params.profile_id
                }
            })
        })
        .then((profile) => {
            if (!profile) throw new Error("Could not find profile")
            // update profile status 
            profile.status = data.status;
            return profile.save();
        })
        .then(async (profile) => {
            if (!profile) throw new Error("Profile could not be updated");
            d.resolve("Profile updated");
        })
        .catch((err) => {
            d.reject(err);
        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;