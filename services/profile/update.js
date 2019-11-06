const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 

var spec = morx.spec({}) 
			   .build('role_id', 'required:false, eg:lender')   
			   .build('profile_id', 'required:true, eg:lender')   
			   .build('url', 'required:false, eg:lender')   
			   .build('business_logo', 'required:false, eg:lender')   
			   .build('business_name', 'required:false, eg:lender')   
			   .build('business_phone', 'required:false, eg:lender')   
			   .build('rc_number', 'required:false, eg:lender')   
			   .build('certificate_of_incorporation', 'required:false, eg:lender')   
			   .build('tin_number', 'required:false, eg:lender')   
			   .build('state', 'required:false, eg:lender')   
			   .build('country', 'required:false, eg:lender')   
			   .build('deleted_flag', 'required:false, eg:lender')   
			              
			   .end();

function service(data){

	var d = q.defer();
	
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;
        
        return [models.profile.findOne({
            where: {
                id: params.profile_id
            }
        }), params];

        
	}) 
	.spread((profile, params) => { 
        if (!profile) throw new Error("Profile does not exist");
        return profile.update({...params});
    }).then((profile)=>{
        if (!profile) throw new Error("An error occured while updating user's profile");        
        d.resolve("Successfully updated user's profile");
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
