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
const moment = require('moment')

var spec = morx.spec({}) 
			   .build('permission_id', 'required:false, eg:1')   
			   .build('fetch_one', 'required:false, eg:1')   
			   .end();

function service(data){

	var d = q.defer();
	
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		let params = validParameters.params;
		
		if (params.fetch_one) {
			return models.permission.findOne({ where: { id: params.permission_id }})
		}
		else {
			return models.permission.findAll()
		}
	}) 
	.then((permission) => { 
        if (!permission) throw new Error(`Permission does not exist`);
        d.resolve(permission)        
    
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
