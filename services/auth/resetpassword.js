const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const bcrypt = require('bcrypt'); 
const validators = require('mlar')('validators'); 
const obval = require('mlar')('obval'); 
const assert = require('mlar')('assertions'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const moment = require('moment');

var spec = morx.spec({}) 
               .build('token', 'required:true')
               .build('new_password', 'required:true')
               .build('confirm_password', 'required:true')
			   .end();

function service(data){

	var d = q.defer();
    
    q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
        params = validParameters.params;

        assert.mustBeValidPassword(data.new_password);

        if (data.new_password != data.confirm_password) throw new Error("Passwords must match");
        
        let reset_token = await models.auth_token.findOne({
            where: {
                type: 'password_reset',
                token: params.token
            }
        });

        if (!reset_token) throw new Error("Token is invalid");
        
        if (reset_token.token) {
            if (reset_token.is_used) throw new Error("Token is used");
			if (moment(new Date()).isAfter(reset_token.expiry)) throw new Error(`Token has expired`);
        }

        return [ models.user.findOne({where: {id: reset_token.user_id}}), params, reset_token];
    })
    .spread((user, params, reset_token) => { 
        return [user, bcrypt.hash(params.new_password, 10), reset_token]
    }) 
	.spread(async( user, generated_password, reset_token) => { 
        if (!user) throw new Error("User does not exist");
        user.password = generated_password;
        
        return [user.save(), reset_token];
        
    }).spread(async (user, reset_token)=>{
        if (!user) throw new Error("An error occured while updating user's account");
        
        await reset_token.update({
            is_used: 1
        })
        d.resolve("Successfully reset user's password");
    })
	.catch( (err) => {
		d.reject(err);
	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
