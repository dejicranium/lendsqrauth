const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const bcrypt = require('bcrypt'); 
const validators = require('mlar')('validators'); 
const obval = require('mlar')('obval'); 
const assert = require('mlar')('assertions'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;

var spec = morx.spec({}) 
               .build('user_id', 'required:true')
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
        
        return [ models.user.findOne({where: {id: params.user_id}}), params];
    })
    .spread((user, params) => { 
        return [user, bcrypt.hash(params.new_password, 10)]
    }) 
	.spread(async( user, generated_password) => { 
       
        user.password = generated_password;
        return user.save();
        
    }).then((user)=>{
        if (!user) throw new Error("An error occured while updating user's account");
        d.resolve("Successfully reset user's password");
    })
	.catch( (err) => {
		d.reject(err);
	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
