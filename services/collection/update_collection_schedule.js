const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');

var spec = morx.spec({})
    .build('schedule_id', 'required:true, eg:1')
    .build('status', 'required:false, eg:1')
    .build('retries', 'required:false, eg:1')
    .end();

function service(data) {

    var d = q.defer();
    const globalUserId = data.USER_ID || 1;
    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });



            return models.collection_schedules.findOne({
                where: {
                    id: params.schedule_id
                }
            })





        })
        .spread((schedule) => {
            if (!schedule) throw new Error("Schedule not found");

            return schedule.update({
                params
            })
        }).then(response => {
            if (!response) throw new Error("There was an error updating the schedule");
            d.reject(response)
        })
        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;