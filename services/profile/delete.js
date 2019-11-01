const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 

var spec = morx.spec({}) 
			   .build('profile_id', 'required:true, eg:lender')       
			   .end();

function service(data){

	var d = q.defer();
	
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;
        
        return models.profile.findOne({
            where:{
                id: params.profile_id
            }
        })

        
	}) 
	.then((profile) => { 
        if (!profile)  throw new Error("Profile not found");
        if (profile.deleted_flag)  throw new Error("Profile already deleted");
        return profile.update({
            deleted_flag: 1,
            deleted_on: new Date(),
        })
    })
    .then((updated)=> {
        if(!updated) throw new Error("Unable to delete profile");
        d.resolve("Successfully deleted profile");
        
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
