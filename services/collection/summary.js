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

            let draftCollections = models.collection.findAndCountAll({
                limit: 1,
                where: {
                    status: "draft"
                }
            })
            let totalCollections = models.collection.findAndCountAll({
                limit: 1
            })
            let inactiveCollections = models.collection.findAndCountAll({
                limit: 1,
                where: {
                    status: "inactive"
                }
            })
            let activeCollections = models.collection.findAndCountAll({
                limit: 1,
                where: {
                    status: "active"
                }
            })
            let declinedCollections = models.collection.findAndCountAll({
                limit: 1,
                where: {
                    status: "declined"
                }
            })

            return [draftCollections, totalCollections, inactiveCollections, activeCollections, declinedCollections];
*/

            let query = `SELECT 
            COUNT(CASE status WHEN 'draft' THEN 1 ELSE null END) as draft, 
            COUNT(CASE status WHEN 'inactive' THEN 1 ELSE null END) inactive, 
            COUNT(CASE status WHEN 'active' THEN 1 ELSE null END) as active, \
            COUNT(CASE status WHEN 'declined' THEN 1 ELSE null END) as declined, \
            COUNT(*) as total
            FROM collections WHERE deleted_flag IS null`
            //return models.sequelize.query(`SELECT COUNT(id), due_date FROM collection_schedules GROUP BY MONTH(due_date)`)
            return models.sequelize.query(query);
        })


        .then((data) => {
            if (!data[0] || !data[0][0]) {
                d.resolve({
                    draft: 0,
                    inactive: 0,
                    active: 0,
                    declined: 0,
                    total: 0
                })
            }
            d.resolve(data[0][0])
        })
        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;