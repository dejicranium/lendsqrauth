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

            //TODO: get profile id 
            /* let profile_id = params.profile_id;

             return models.collection.findOne({
                 where: 
             }) */
        })
        .then(async profile => {
            if (!profile) throw new Error("Profile does not exist");



            ern


            return profile.update(params)
        }).then(async (profile) => {
            if (!profile) throw new Error("An error occured while updating user's profile");

            let audit = new AuditLog(data.reqData, "UPDATE", "updated team member with profile id " + profile.id);
            await audit.create();

            d.resolve("Successfully updated user's profile");
        })
        .catch((err) => {
            d.reject(err);
        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;