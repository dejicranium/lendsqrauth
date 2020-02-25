const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const AuditLog = require('mlar')('audit_log');

var spec = morx.spec({})
    .build('profile_id', 'required:true, eg:lender')
    .end();

function service(data) {

    var d = q.defer();

    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;
            return models.profile.findOne({
                where: {
                    id: params.profile_id,
                    parent_profile_id: data.profile.id
                }
            })
        })
        .then(async (profile) => {
            if (!profile) throw new Error("Profile does not exist as a team member of yours");

            profile.deleted_flag = true;
            profile.deleted_by = data.profile.id;
            profile.deleted_on = new Date();
            return profile.save()

        }).then(async (deleted) => {
            if (!deleted) throw new Error("Could not delete profile");
            d.resolve(deleted);

        })
        .catch((err) => {
            d.reject(err);
        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;