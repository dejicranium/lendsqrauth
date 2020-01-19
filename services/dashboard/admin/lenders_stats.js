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
            let role = await models.profile.findOne({
                where: {
                    name: {}
                }
            })

            let year = new Date().getFullYear();
            let query = `SELECT MONTH(created_on) as month, COUNT(*) as num
            FROM profiles WHERE
            role_id = 4 and YEAR(created_on)= '${year}'
            GROUP BY MONTH(created_on)`;
            return models.sequelize.query(query)

        })
        .then(async report => {
            if (!report) d.resolve({})
            report = JSON.parse(JSON.stringify(report[0]));

            d.resolve(report)

        })
        .catch(err => {
            d.reject(err);
        })

    return d.promise;

}





















service.morxspc = spec;
module.exports = service;