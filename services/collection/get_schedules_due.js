const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const moment = require('moment')
const paginate = require('mlar')('paginate');

var spec = morx.spec({})
    .end();

function service(data) {

    var d = q.defer();
    const globalUserId = data.USER_ID || 1;
    q.fcall(async () => {
            let n = new Date();
            let start = (process.env.NODE_ENV == 'development') ? moment(moment(new Date()).format('YYYY-MM-DD') + ' 00:00:00', moment.ISO_8601) : moment(moment(new Date()).format('YYYY-MM-DD') + ' 00:00:00', moment.ISO_8601).add(1, 'h');
            let stop = (process.env.NODE_ENV == 'development') ? moment(moment(new Date()).format('YYYY-MM-DD') + ' 23:59:59', moment.ISO_8601) : moment(moment(new Date()).format('YYYY-MM-DD ') + '23:59:59', moment.ISO_8601).add(1, 'h');

            data.where = {
                due_date: {
                    $gte: start,
                    $lte: stop

                },
                status: {
                    $ne: "Successful"
                }
            }
            return [models.collection_schedules.findAll(data), data];

        })
        .spread((schedules, data) => {
            if (!schedules) throw new Error("No schedules available");
            schedules = JSON.parse(JSON.stringify(schedules))


            d.resolve(schedules);

            //d.resolve(paginate(schedules.rows, 'schedules', schedules.count, Number(data.limit), data.page));
        })
        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;