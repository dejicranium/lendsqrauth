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
			   .build('name', 'required:true, eg:lender')   
			   .build('description', 'required:true, eg:lender')   
			   .end();

function service(data){

	var d = q.defer();
	
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		let params = validParameters.params;
         
        return [ models.permission.findOne({ where: { name: params.name, description:params.description }}), params]
	}) 
	.spread((permission, params) => { 
        if (permission) throw new Error(`Permission already exists`);
		
		params.created_on = new Date();
		return models.permission.create(params)        
        
    }).then((permission)=>{
        if (!permission) throw new Error("An error occured while carrying out this operation");
        d.resolve(permission)
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
