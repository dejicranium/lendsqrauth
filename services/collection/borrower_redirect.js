const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const AuditLog = require('mlar')('audit_log');

var spec = morx.spec({})
    .build('token', 'required:true, eg:lender')
    .end();

function service(data) {

    var d = q.defer();

    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;

            return models.borrower_invites.findOne({
                where: {
                    token: params.token
                }
            })
        })
        .then(async token => {
            if (!token) throw new Error('Could not find redirect collection');

            return models.collection.findOne({
                where: {
                    id: token.collection_id
                }
            })

        }).then(async (collection) => {
            if (!collection) throw new Error("Could not find collection");
            let product = await models.collection_init_state.findOne({
                where: {
                    collection_id: collection.id
                }
            })
            collection = JSON.parse(JSON.stringify(collection))
            collection.product = JSON.parse(product.state);
            d.resolve(collection)

        })
        .catch((err) => {
            d.reject(err);
        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;