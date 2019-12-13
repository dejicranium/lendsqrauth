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
                }
            })

        })
        .then((schedule) => {
            if (!schedule) throw new Error("No schedule found");
            if (data.profile.role !== 'admin' && ![schedule.lender_id, schedule.borrower_id].includes(data.profile.id)) {
                throw new Error("Unauthorized access")
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