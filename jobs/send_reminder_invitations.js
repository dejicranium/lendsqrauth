const models = require('mlar')('models');
const q = require('q');
const moment = require('moment');
const processUtil = require('../utils/process_tracker');
const cron = require('node-cron');
const sendReminder = require('../services/collection/send_invitation_reminder')

module.exports = () => {
    function updateOffset(modelInstance) {
        const d = q.defer();
        q.fcall(() => {
                return models.process_tracker.findOrCreate({
                    where: {
                        name: 'reminder_invitation_cron',

                    },
                    defaults: {
                        name: 'reminder_invitation_cron',
                        latest_stop_id: modelInstance.id,
                        lastest_date: modelInstance.next_reminder_date,
                    }
                })
            })
            .spread(async (model, created) => {
                if (!created) {
                    await model.update({
                        latest_stop_id: modelInstance.id,
                        latest_date: modelInstance.next_reminder_date,
                    })
                }

                d.resolve(model)
            })
            .catch(err => {
                d.reject(err)
            })

        return d.promise;

    }

    async function updateNextReminderDate(arrayOfModels) {
        let transformedModels = [];
        for (let i = 0; i < arrayOfModels.length; i++) {
            let modelInstance = arrayOfModels[i];
            modelInstance.next_reminder_date = modelInstance.next_reminder_date ? moment(modelInstance.next_reminder_date).add(4, 'days') : moment().add(4, 'days');
            transformedModels.push(modelInstance)
        }

        return await models.borrower_invites.bulkCreate(transformedModels, {
            updateOnDuplicate: ['next_reminder_date']
        })
    }

    async function getRemindersDue() {

        let processDetails = await models.process_tracker.findOne({
            where: {
                name: 'reminder_invitation_cron',

            }
        })

        if (!processDetails || !processDetails.id) {
            processDetails = {
                latest_stop_id: 0,
                latest_date: moment().format('YYYY-MM-DD')
            }
        }

        const d = q.defer();
        let {
            offset,
            date
        } = processUtil.next_process_cycle(processDetails.latest_stop_id, processDetails.latest_date)

        let from = date + ' 00:00:00'
        let stop = date + ' 11:59:59'

        console.log('start time is ' + from)
        console.log('now is is ' + moment().format("YYYY-MM-DD"))

        console.log('end time is ' + stop)
        q.fcall(() => {
                let sqlQuery = `SELECT * from borrower_invites WHERE status = 'Pending' AND next_reminder_date BETWEEN '${from}' AND '${stop}' AND id > ${offset} LIMIT 100`

                return models.sequelize.query(sqlQuery);
            })
            .then(invites => {
                if (invites.length < 1) d.resolve([])
                else {

                    d.resolve(invites[0])
                }
            })
            .catch(error => {
                d.reject(error)
            })

        return d.promise
    }



    cron.schedule('*/1 * * * *', async () => {

        let invites = await getRemindersDue();
        console.log('sending reminders for ' + invites.length + ' invitation');
        for (let i = 0; i < invites.length; i++) {
            let invite = invites[i];

            if (invites.length - 1 == i) {
                await updateOffset(invite)
            }
            await sendReminder(invite);
        }

        await updateNextReminderDate(invites);

        console.log('Done sending reminders for ' + invites.length + ' invitation');


    })
}