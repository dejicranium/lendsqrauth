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
			   .build('type', 'required:true, eg:lender')   
			   .build('subtype', 'required:false, eg:lender')   
			   .end();

function service(data){

	var d = q.defer();
	
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		let params = validParameters.params;
         
        return [ models.role.findOne({ where: { type: params.type }}), params]
	}) 
	.spread((role, params) => { 
        if (role) throw new Error(`Role already exists`);
        return models.role.create({type: params.type})        
        
    }).then((role)=>{
        if (!role) throw new Error("An error occured while carrying out this operation");
        d.resolve(role)
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
