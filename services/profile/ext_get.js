const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const paginate = require('mlar')('paginate');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;

var spec = morx.spec({})
    .build('profile_ids', 'required:true, eg:1')
    .end();

function service(data) {

    const d = q.defer();

    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;


            let profile_ids = params.profile_ids.split(',');

            return models.profile.findAll({
                where: {
                    id: {
                        $in: profile_ids
                    }
                },
                include: [{
                    model: models.user,
                    attributes: {
                        exclude: DEFAULT_EXCLUDES
                    }
                }]
            })

        })
        .then((profiles) => {
            if (!profiles) d.resolve([]);
            d.resolve(profiles)
        })
        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;