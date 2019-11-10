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

var spec = morx.spec({}) 
			   .build('token', 'required:true')   
			   .build('type', 'required:true')   
			   .end();

function service(data){

	var d = q.defer();
	
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		let params = validParameters.params;
    
		
        return models.auth_token.findOne({
            where: {
				token: params.token,
				type: params.type,
            }
        })
	}) 
	.then(async (auth_token) => { 
		if (!auth_token) throw new Error(`Token was not found`);
		if (auth_token.is_used) throw new Error("Token has been previously used");
		if (auth_token.expiry) {
			// check whether token is yet to expire;
			if (moment(new Date()).isAfter(auth_token.expiry)) throw new Error(`Token has expired`);
		}
		// set auth_token to status 'used';
		await auth_token.update({is_used: true});

		// if it's an account activation token, activate user's account
		if (auth_token.type == 'user_activation') {
			let user = await  models.user.findOne({where: {id: auth_token.user_id}});
			user.active = 1;
			await user.save();
		}
		d.resolve(auth_token);
        
   
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
