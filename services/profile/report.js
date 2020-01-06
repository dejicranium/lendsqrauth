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
            let roles = await models.role.findAll();
            let borrower_role = roles.find(r => r.name == 'borrower')
            let individual_lender_role = roles.find(r => r.name == 'individual_lender')
            let business_lender_role = roles.find(r => r.name == 'business_lender')

            let query = await models.sequelize.query(`SELECT 
                COUNT(CASE role_id WHEN ${borrower_role.id} THEN 1 ELSE null END) as borrowers,
                COUNT(CASE role_id WHEN ${individual_lender_role.id} THEN 1 ELSE null END) as individual_lenders,
                COUNT(CASE role_id WHEN ${business_lender_role.id} THEN 1 ELSE null END) as business_lenders
                FROM profiles
            `)

            let active_determiner = await models.sequelize.query(`
            SELECT COUNT(Distinct(p.id)) as active_lenders  FROM profiles as p INNER JOIN collections as c ON p.id = c.lender_id`)


            /*

                let query = await;
                let query = await models.sequelize.query(`SELECT 
                    COUNT(CASE status WHEN 'Successful' THEN 1 ELSE null END) as successful_volume, 
                    COUNT(CASE status WHEN 'Pending' THEN 1 ELSE null END) as pending_volume, 
                    COUNT(CASE status WHEN 'Failed' THEN 1 ELSE null END) as failed_volume, \
                    COUNT(*) as total_volume,\
                    SUM(CASE WHEN status = 'Successful' THEN total_amount END) successful_value,\
                    SUM(CASE WHEN status = 'Failed' THEN total_amount END) failed_value,\
                    SUM(CASE WHEN status = 'Pending' THEN total_amount END) pending_value,\
                    SUM(total_amount) as total_value 
                    FROM collection_schedules`)*/
            //return models.sequelize.query(`SELECT COUNT(id), due_date FROM collection_schedules GROUP BY MONTH(due_date)`)
            return [query, active_determiner];
        })
        .spread((query, active_lenders) => {
            let response = {
                ...query[0][0],
                ...active_lenders[0][0]
            }
            d.resolve(response);
        })
        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;