const morx = require('morx');
const models = require('mlar')('models');
const notification = require('mlar').mreq('notifs', 'account_notifications');
const AuditLog = require('mlar')('audit_log');

const specx = morx.spec({})
    .build('user_id', 'required:true')
    .build('reason', 'required:true')
    .end();
async function deactivateUser(data) {
    const result = morx.validate(data, specx, {
        throw_error: true
    });

    const params = result.params;
    const user = await models.user.findOne({
        where: {
            id: params.user_id
        }
    });
    if (!user) throw new Error("User does not exist");
    if (user.status === 'deactivated') throw new Error("User is already deactivated");
    await user.update({ status: 'deactivated', status_reason: params.reason });
    await user.reload();
    await notification.userDeactivated(user);
    let auditLog = new AuditLog(data.reqData, "UPDATE", "deactivated account with user id " + user.id);
    auditLog.create().catch((error) => { });
    return "Successfully updated user's status";
}

module.exports = deactivateUser;