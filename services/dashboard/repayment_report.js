const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const config = require('../../config');
const makeRequest = require('mlar')('makerequest');
const crypto = require('crypto');
const requests = require('mlar')('requests');
const moment = require('moment');

var spec = morx.spec({})
    .build('profile_id', 'required:false, eg:lender')
    .end();





function service(data) {

    var d = q.defer();

    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;
            let today_start = moment().format('YYYY-MM-DD') + " 00:00:00"
            let today_end = moment().format('YYYY-MM-DD') + " 23:59:59"


            const startOfMonth = moment().startOf('month').format('YYYY-MM-DD hh:mm');
            const endOfMonth = moment().endOf('month').format('YYYY-MM-DD hh:mm');

            let query = `SELECT SUM(CASE WHEN due_date BETWEEN '${today_start}' AND '${today_end}' AND status = 'Successful' THEN total_amount ELSE 0 END) as repayment_collected_today, \
            SUM(CASE WHEN due_date BETWEEN '${startOfMonth}' AND '${endOfMonth}' THEN total_amount ELSE 0 END) as month_amount_due, 
            SUM(CASE WHEN due_date < '${today_start}' AND status = 'Pending' OR 'Failed' THEN total_amount ELSE 0 END) as repayment_past_due
            FROM collection_schedules WHERE lender_id = ${data.profile.id}\
             `;
            return models.sequelize.query(query)

        })
        .then(async report => {
            if (!report) d.resolve({})

            d.resolve(report[0][0])

        })
        .catch(err => {
            d.reject(err);
        })

    return d.promise;

}





















service.morxspc = spec;
module.exports = service;