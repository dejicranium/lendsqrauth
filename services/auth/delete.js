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
			   .build('user_id', 'required:true, eg:1')                  
			   .end();

function service(data){

	var d = q.defer();
	
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;
		        

        return [models.user.findOne({where: {id: params.user_id}
        }), params ]
	}) 
	.spread((user, params) => { 
        if (!user) throw new Error("User does not exist");
        // soft delete
        return user.update({deleted: 1, deleted_at: new Date(), active: 0, disabled: 0});
        
    }).then((user)=>{
        if (!user) throw new Error("An error occured while updating user's account");
        
        d.resolve("Successfully deleted user's status");
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
