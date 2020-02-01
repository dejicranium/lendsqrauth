const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const AuditLog = require('mlar')('audit_log');

var spec = morx.spec({})
    //.build('token', 'required:true, eg:lender')
    .end();

function service(data) {

    var d = q.defer();

    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;

            return models.collection.findAll({
                where: {
                    borrower_id: data.profile.id,
                    status: 'inactive'
                },
                include: [{
                    model: models.product
                }]
            })


        })
        .then(async collections => {
            d.resolve(collections)

        })
        .catch((err) => {
            d.reject(err);
        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;