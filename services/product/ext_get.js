const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const paginate = require('mlar')('paginate');

var spec = morx.spec({})
    .build('product_ids', 'required:true, eg:1')
    .end();

function service(data) {

    const d = q.defer();

    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;


            let product_ids = params.product_ids.split(',');

            return models.product.findAll({
                where: {
                    id: {
                        $in: product_ids
                    }
                },

            })

        })
        .then((products) => {
            if (!products) d.resolve([]);
            d.resolve(products)
        })
        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;