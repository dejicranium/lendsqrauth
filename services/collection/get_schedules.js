const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const moment = require('moment')
const paginate = require('mlar')('paginate');

var spec = morx.spec({})
    .build('from', 'required:false, eg:nothing')
    .build('collection_id', 'required:false, eg:nothing')
    .build('lender_id', 'required:false, eg:nothing')
    .build('borrower_id', 'required:false, eg:nothing')
    .build('loan_id', 'required:false, eg:nothing')
    .build('to', 'required:false, eg:nothing')


    .end();

function service(data) {

    var d = q.defer();
    const globalUserId = data.USER_ID || 1;
    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;
            const page = data.page ? Number(data.page) : 1;
            const limit = data.limit ? Number(data.limit) : 20;
            const offset = page ? (page - 1) * limit : false;

            data.limit = limit;
            data.offset = offset;
            data.where = {

            }

            if (data.to && data.from) {
                let start = moment(moment(queryData.from).format('YYYY-MM-DD') + ' 00:00:00', moment.ISO_8601);
                let stop = moment(moment(queryData.to).format('YYYY-MM-DD') + ' 23:59:59', moment.ISO_8601)

                data.created_on.where = {
                    $gte: start,
                    $lte: stop
                };
            }
            if (data.lender_id) {
                data.where.lender_id = data.lender_id;
                delete data.lender_id
            }
            if (data.borrower_id) {
                data.where.borrower_id = data.borrower_id;
                delete data.borrower_id
            }
            if (data.loan_id) {
                data.where.loan_id = data.loan_id;
                delete data.loan_id
            }
            if (data.collection_id) {
                data.where.collection_id = data.collection_id;
                delete data.collection_id
            }

            return [models.collection_schedules.findAndCountAll(data), data];

        })
        .spread((schedules, data) => {
            if (!schedules) throw new Error("No schedules available");

            d.resolve(paginate(schedules.rows, 'schedules', schedules.count, Number(data.limit), data.page));
        })
        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;