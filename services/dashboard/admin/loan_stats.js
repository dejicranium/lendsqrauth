const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const config = require('../../../config');
const makeRequest = require('mlar')('makerequest');
const crypto = require('crypto');
const requests = require('mlar')('requests');
const moment = require('moment');

var spec = morx.spec({})
    //.build('profile_id', 'required:false, eg:lender')
    .end();





function service(data) {

    var d = q.defer();

    q.fcall(async () => {
            let year = data.year || new Date().getFullYear();
            let l = `SELECT MONTH(created_on) as month,  
            SUM(total_amount) as total,
            SUM(CASE status WHEN 'Successful' THEN total_amount ELSE 0 END) as total_successful,
            SUM(CASE status WHEN 'Failed' THEN total_amount ELSE 0 END) as total_failed
            FROM collection_schedules WHERE YEAR(created_on) = "${year}"
            GROUP BY MONTH(created_on)`;
            return models.sequelize.query(l)
        })
        .then(async report => {
            if (!report) d.resolve({})
            report = JSON.parse(JSON.stringify(report[0]));


            for (let i = 1; i < 13; i++) {
                if (!report[i - 1]) {
                    let report_obj = {
                        month: i,
                        total: 0,
                        total_successful: 0,
                        total_failed: 0
                    }
                    report.push(report_obj)

                }
            }
            d.resolve(report)

        })
        .catch(err => {
            console.log(err.stack)
            d.reject(err);
        })

    return d.promise;

}





















service.morxspc = spec;
module.exports = service;