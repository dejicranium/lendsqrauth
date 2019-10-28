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
			   .build('current_password', 'required:true, eg:somethingsweet')   
               .build('new_password', 'required:true')
               .build('confirm_password', 'required:true')
			   .end();

function service(data){

	var d = q.defer();
	
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;
        
        if (!validators.areMutuallyExclusive([data.confirm_password, data.new_password]))
            throw new Error("Passwords do not match")
        if (!validators.areMutuallyExclusive([data.current_password, data.new_password]))   
            throw new Error("Current password cannot be the same as new password")

        if (data.new_password.length < 8) throw new Error("Password cannot be less than 8 characters");

        // get and hash password 
        return [models.user.findOne({where: {id: data.user_id}}), bcrypt.hash(data.new_password, 10);
	}) 
	.spread((user, generated_password) => { 
        if (!user) throw new Error("Could not fetch user details")
        if (!generated_password) throw new Error("Could not generate new password")
        
        user.password = generated_password;
        
        return user.save();
        
    }).then((user)=>{
        if (!user) throw new Error("An error occured while updating user's account");
        
        d.resolve("Successfully changed user's password");
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
