const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const AuditLog = require('mlar')('audit_log');
const notifications = require("../../utils/notifs/account_notifications");

var spec = morx.spec({})
    .build('profile_id', 'required:true')
    .build('status', 'required:true')
    .build('reason', 'required:false')
    .end();


async function sendNotifications(oldStatus, profile) {
    if (profile.status === oldStatus) {
        return;
    }
    if (oldStatus === 'deactivated' && profile.status === 'active') {
        await notifications.profileReactivated(profile);
    } else if (profile.status === 'deactivated') {
        await notifications.profileDeactivated(profile);
    }
}

function service(data) {

    var d = q.defer();

    q.fcall(async () => {
        const validParameters = morx.validate(data, spec, {
            throw_error: true
        });
        const params = validParameters.params;
        let previousStatus

        const statuses = ['active', 'inactive', 'blacklisted', 'deactivated'];
        if (!statuses.includes(params.status)) {
            throw new Error("Status should be one of " + statuses.join(', '));
        }
        return models.profile.findOne({
            where: {
                id: params.profile_id
            },
            include: [{
                model: models.user
            }, {
                model: models.role
            }]
        })
    })
        .then((profile) => {
            if (!profile) throw new Error("Could not find profile")
            // update profile status 
            previousStatus = profile.status;
            profile.status = data.status;
            profile.status_reason = data.reason;
            return profile.save();
        })
        .then(async (profile) => {
            if (!profile) throw new Error("Profile could not be updated");
            await sendNotifications(previousStatus, profile);
            d.resolve("Profile updated");
        })
        .catch((err) => {
            d.reject(err);
        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;