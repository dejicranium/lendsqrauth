const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const paginate = require('mlar')('paginate');

/**
 * This endpoint gets a list of lenders
 * But the kindof lenders that are returned depends on the parameters passed
 * 
 */
var spec = morx.spec({})
    .build('profile_id', 'required:true, eg:1')
    .build('profile_type', 'required:false, eg:1')
    .end();

function service(data) {

    var d = q.defer();
    const page = data.page ? Number(data.page) : 1;
    const limit = data.limit ? Number(data.limit) : 20;
    const offset = page ? (page - 1) * limit : false;

    data.limit = limit;
    data.offset = offset;

    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;

            data.where = {
                borrower_id: data.profile_id,
                //status: 'active' // meaning collections that were not declined
            }
            data.include = [{
                model: models.product,
                include: [{
                    model: models.profile,
                    include: [{
                        model: models.user,
                        attributes: ['business_name', 'first_name', 'last_name']
                    }]
                }]
            }]

            return models.collection.findAndCountAll(data);


        })
        .then((collections) => {

            if (!collections) throw new Error("No profiles");
            d.resolve(paginate(collections.rows, 'collections', collections.count, limit, page));

        })
        .catch((err) => {
            d.reject(err);
        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;