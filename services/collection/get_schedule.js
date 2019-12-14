const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const moment = require('moment')
const paginate = require('mlar')('paginate');

var spec = morx.spec({})
    .build('id', 'required:false, eg:nothing')
    .end();

function service(data) {

    var d = q.defer();
    q.fcall(async () => {
            return models.collection_schedules.findOne({
                where: {
                    id: data.id
                },
                include: [{
                        model: models.collection
                    },
                    {
                        model: models.product
                    },

                ]
            })

        })
        .then(async (schedule) => {
            if (!schedule) throw new Error("No schedule found");

            if (data.profile.role !== 'admin' && ![schedule.lender_id, schedule.borrower_id].includes(data.profile.id)) {
                throw new Error("Unauthorized access")
            }

            schedule = JSON.parse(JSON.stringify(schedule));
            let lender = await models.profile.findOne({
                where: {
                    id: schedule.lender_id
                },
                include: [{
                    model: models.user
                }]
            })
            let borrower = await models.profile.findOne({
                where: {
                    id: schedule.borrower_id
                },
                include: [{
                    model: models.user
                }]
            })

            if (lender && lender.id) {
                schedule.lender = lender;
            }
            if (borrower && borrower.id) {
                schedule.borrower = borrower
            }

            d.resolve(schedule);
        })
        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;