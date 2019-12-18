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
            /*
            let query = await models.sequelize.query(`SELECT \
                COUNT(status='Successful') as successful_volume,
                COUNT(status='Pending') as pending_volume, \
                COUNT(status='Failed') as failed_volume, \
                COUNT(*) as total_volume,
                SUM(total_amount) as total_value
                SUM(total_amount where status='Failed') as failed_value,
                FROM collection_schedules`)*/
            return models.collection_schedules.findAll({
                group: [sequelize.fn('date_trunc', 'month', sequelize.col('due_date'))]
            })
            //return query;
        })
        .then((query) => {

            d.resolve(query);
        })
        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;