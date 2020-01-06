const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const moment = require('moment')
const paginate = require('mlar')('paginate');


function service(data) {

    var d = q.defer();
    q.fcall(async () => {
            let collection = await models.collection.findOne({
                where: {

                },
                include: [{
                    model: models.profile,
                    include: [{
                        model: models.user,
                        attributes: {
                            exclude: ['password']
                        }
                    }]
                }]
            })
        })
        .spread(() => {
            if (!borrower_invites) throw new Error("No schedules available");

            d.resolve(paginate(borrower_invites.rows, 'invitations', borrower_invites.count, Number(data.limit), data.page));
        })
        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;