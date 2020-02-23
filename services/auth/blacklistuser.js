const models = require('mlar')('models');
const morx = require('morx');
const q = require('q');
const AuditLog = require('mlar')('audit_log');
const notifications = require("../../utils/notifs/account_notifications");

var spec = morx.spec({})
    .build('user_id', 'required:true') // to be used by admin
    .build('reason', 'required:true') // to be used by admin
    .end();

const collectionUpdateQuery = `UPDATE collections JOIN profiles
    ON (collections.lender_id = profiles.id OR collections.borrower_id = profiles.id)
    SET collections.status = ? 
    WHERE profiles.user_id = ? and collections.status = ?`;

const collectionScheduleQuery = `UPDATE collection_schedules JOIN profiles
    ON (collection_schedules.lender_id = profiles.id OR collection_schedules.borrower_id = profiles.id)
    SET collection_schedules.status = ? 
    WHERE profiles.user_id = ? and (collection_schedules.status = ? or collection_schedules.status = ?)`;

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
            if (user.status === 'blacklisted') throw new Error('User is already blacklisted');

            let updateData = {
                status: 'blacklisted'
            }
            if (params.reason) {
                updateData.status_reason = params.reason
            }
            return models.sequelize.transaction((t) => {
                return q.all([
                    user.update(updateData, {
                        transaction: t
                    }),
                    models.sequelize.query(collectionUpdateQuery,
                        {
                            replacements: ['blacklisted', user.id, 'pending'],
                            transaction: t
                        }
                    ),
                    models.sequelize.query(collectionScheduleQuery,
                        {
                            replacements: ['blacklisted', user.id, 'pending', 'failed'],
                            transaction: t
                        })
                ])
            })

        }).then(async (user) => {
            if (!user) throw new Error("An error occurred while updating user's account");
            await notifications.userBlacklisted(user);
            data.reqData.user = JSON.parse(JSON.stringify(user));
            let audit_log = new AuditLog(data.reqData, 'UPDATE', "blacklisted user " + user.id);
            await audit_log.create().catch((error) => { });;


            d.resolve("Successfully updated user's status");
        })
        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;