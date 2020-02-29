const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const paginate = require('mlar')('paginate');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const AuditLog = require('mlar')('audit_log');

var spec = morx.spec({})
    .build('action_type', 'required:true, eg:lender')
    .build('reqData', 'required:true, eg:lender')
    .build('action', 'required:true, eg:lender')

    .end();

function service(data) {
    let params = morx.validate(data, spec, {
        throw_error: true
    }).params;
    q.fcall(() => {
        let audit = new AuditLog(params.reqData, params.action_type, params.action);
        return audit.create();
    }).then(resp => {
        if (!resp) throw new Error("Could not create audit log");
        d.resolve(resp);
    }).catch(err => {
        d.reject(err)
    });
    return d.promise;
}
service.morxspc = spec;
module.exports = service;