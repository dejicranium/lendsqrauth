const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const config = require('../../config');
const makeRequest = require('mlar')('makerequest');
const crypto = require('crypto');
const requests = require('mlar')('requests');

var spec = morx.spec({})
    .build('status', 'required:true, eg:lender')
    .build('collection_id', 'required:true, eg:lender')
    .end();





function service(data) {

    var d = q.defer();

    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;
            if (!['active', 'inactive'].includes(params.status)) {
                throw new Error("Status should be either `active` or `inactive`")
            }
            return [

                models.collection.findOne({
                    where: {
                        id: params.collection_id,
                        lender_id: data.profile.id
                    }
                }),
                params
            ]
        })
        .spread(async (collection, params) => {
            if (!collection) throw new Error("No such collection exists for this profile");
            if (params.status == collection.status) throw new Error(`Collection is already ${collection.status}`)
            if (params.status == 'active' && collection.status != 'inactive') throw new Error(`You can activate an inactive collection only`)
            if (params.status == 'inactive' && collection.status != 'active') throw new Error(`You can deactivate an activate collection only`)

            return collection.update(params)
        })
        .then(async collection => {
            if (!collection) throw new Error("Could not update collection");
            d.resolve(collection)

        })
        .catch(err => {
            d.reject(err);
        })

    return d.promise;

}





















service.morxspc = spec;
module.exports = service;