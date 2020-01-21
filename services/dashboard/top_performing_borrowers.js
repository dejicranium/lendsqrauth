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
    .build('limit', 'required:false')
    .end();





function service(data) {

    var d = q.defer();

    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;

            const limit = params.limit || 5;

            let query = `SELECT u.first_name, u.last_name, SUM(CASE WHEN cs.borrower_id = p.id THEN cs.total_amount ELSE\
                0 END) as total_amount, SUM(CASE WHEN cs.borrower_id = p.id AND cs.status = 'Successful' THEN\
                cs.total_amount ELSE 0 END) as total_repaid FROM users as u \
                INNER JOIN profiles as p ON p.user_id = u.id \
                INNER JOIN collections AS c ON c.lender_id = p.parent_profile_id \
                INNER JOIN collection_schedules AS cs ON cs.borrower_id = c.borrower_id \
                WHERE cs.lender_id = ${data.profile.id} AND u.first_name is not null \
                GROUP BY p.id ORDER BY total_amount DESC LIMIT ${limit}`;

            return models.sequelize.query(query)

        })
        .then(async report => {
            if (!report) d.resolve({});

            d.resolve(report[0]);

        })
        .catch(err => {
            d.reject(err);
        })

    return d.promise;

}





















service.morxspc = spec;
module.exports = service;