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
			   .build('type', 'required:true')   
			   .build('role_id', 'required:true')   
			   .end();

function service(data){

	var d = q.defer();
	
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		let params = validParameters.params;
         
        return [models.role.findOne({ where: { id: params.role_id }}), params];
	}) 
	.spread((role, params) => { 
        if (!role) throw new Error(`Could not find role`)
        		 
		return role.update({type: params.type})

	}).then(done=> {
		if (!done) throw new Error("Could not update role")
		d.resolve("Successfully updated role ")
	})
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
