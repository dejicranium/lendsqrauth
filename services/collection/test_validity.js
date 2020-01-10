
const morx = require('morx');
const q = require('q');
const validate = require('../../utils/collections').validateSetup;

var spec = morx.spec({})
    .build('tenor', 'required: true')
    .build('tenor_type', 'required:true')
    .build('num_of_collections', 'required:true')
    .build('collection_frequency', 'required:true')
    .end();

function service(data) {

    var d = q.defer();
    q.fcall(async () => {
        const validParameters = morx.validate(data, spec, {
            throw_error: true
        });
        const params = validParameters.params;

        let result = validate(params.tenor, params.tenor_type, params.num_of_collections, params.collection_frequency);
        return result
    })
    .then(resp=> {
        d.resolve(resp)
    }).catch(error=> {
        d.reject(error);
    })


    return d.promise;

}
service.morxspc = spec;
module.exports = service;