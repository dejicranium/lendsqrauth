const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const bcrypt = require('bcrypt'); 
const validators = require('mlar')('validators'); 
const obval = require('mlar')('obval'); 
const assert = require('mlar')('assertions'); 
const crypto = require('crypto');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const moment = require('moment');
const AuditLog = require('mlar')('audit_log');

var spec = morx.spec({}) 
			   .build('name', 'required:true, eg:lender')   
			   .end();

function service(data){

	var d = q.defer();
	
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		let params = validParameters.params;
         if (params.name.length < 3) {
			 throw new Error("Name cannot be less than 3 characters");
		 }
        return [ models.role.findOne({ where: { name: params.name }}), params]
	}) 
	.spread((role, params) => { 
        if (role) throw new Error(`Role already exists`);
        return models.role.create({name: params.name})        
        
    }).then(async (role)=>{
        if (!role) throw new Error("An error occured while carrying out this operation");
        let audit_log = new AuditLog(data.reqData, 'CREATE', 'created a new role named "' + role.name + '"')
        await audit_log.create()
		d.resolve(role)
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
