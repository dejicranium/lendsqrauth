const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const AuditLog = require('mlar')('audit_log');

var spec = morx.spec({})
    .build('profile_id', 'required:true, eg:lender')
    .build('role_id', 'required:false, eg:lender')
    .build('status', 'required:false, eg:lender')
    .end();

function service(data) {

    var d = q.defer();

    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;
            if (Object.keys(params).length === 1) throw new Error("Please pass a value to update") // profile_id will always be there
            if (params.status) {
                if (!['active', 'inactive'].includes(params.status.toLowerCase())) throw new Error("Choose either active or inactive as a status")
            }
            if (params.role_id) {
                //if (!['active', 'inactive'].includes(params.status)) throw new Error("Pass either active or inactive as a status")
                // get roles.
                let role = await models.role.findOne({
                    where: {
                        id: params.role_id
                    }
                });
                if (!role && !role.id) throw new Error("Role not found");
                role = role.name
                if (['admin', 'business_lender', 'borrower', 'individual_lender'].includes(role)) {
                    throw new Error("You cannot change team member's status to " + role);
                }
            }
            return [
                models.profile.findOne({
                    where: {
                        id: params.profile_id
                    }
                }),
                params
            ]
        })
        .spread(async (profile, params) => {
            if (!profile) throw new Error("Profile does not exist");
            if (parseInt(profile.parent_profile_id) != parseInt(data.profile.id)) {
                throw new Error("You can't update the profile of a non-team member")
            }
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