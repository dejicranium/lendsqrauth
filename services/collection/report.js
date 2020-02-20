const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');

var spec = morx.spec({})
    .end();

function service(data) {

    var d = q.defer();
    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;

            let query = await models.sequelize.query(`SELECT 
                COUNT(CASE status WHEN 'Successful' THEN 1 ELSE null END) as successful_volume, 
                COUNT(CASE status WHEN 'Pending' THEN 1 ELSE null END) as pending_volume, 
                COUNT(CASE status WHEN 'Failed' THEN 1 ELSE null END) as failed_volume, \
                COUNT(*) as total_volume,\
                SUM(CASE WHEN status = 'Successful' THEN total_amount END) successful_value,\
                SUM(CASE WHEN status = 'Failed' THEN total_amount END) failed_value,\
                SUM(CASE WHEN status = 'Pending' THEN total_amount END) pending_value,\
                SUM(total_amount) as total_value
                FROM collection_schedules`)
            //return models.sequelize.query(`SELECT COUNT(id), due_date FROM collection_schedules GROUP BY MONTH(due_date)`)
            return query;
        })
        .then((query) => {

            d.resolve(query[0][0]);
        })
        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;