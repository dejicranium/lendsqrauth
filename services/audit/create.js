const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const paginate = require('mlar')('paginate');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;

var spec = morx.spec({})
    .build('action_type', 'required:false, eg:lender')
    .build('actor_meta', 'required:false, eg:lender')
    .build('actor_id', 'required:false, eg:lender')
    .build('action', 'required:false, eg:lender')

    .end();

function service(data) {
    let params = morx.validate(data, spec, {throw_error:true}).params;
    q.fcall(() => {
        return models.audit_log.create(params);
    }) .then(resp=> {
        if (!resp) throw new Error("Could not create audit log");
        d.resolve(resp);
    }) .catch(err=> {
        d.reject(err)
    });
    return d.promise;
}
service.morxspc = spec;
module.exports = service;