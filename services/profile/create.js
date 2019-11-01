const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 

var spec = morx.spec({}) 
			   .build('type', 'required:true, eg:lender')   
			   .build('user_id', 'required:true, eg:lender')   
			   .build('parent_lender_id', 'required:false, eg:1')   
			   .build('url', 'required:false, eg:lender')   
			   .build('business_logo', 'required:false, eg:lender')   
			   .build('business_name', 'required:false, eg:lender')   
			   .build('business_phone', 'required:false, eg:lender')   
			   .build('rc_number', 'required:false, eg:lender')   
			   .build('certificate_of_incorporation', 'required:false, eg:lender')   
			   .build('tin_number', 'required:false, eg:lender')   
			   .build('state', 'required:false, eg:lender')   
			   .build('country', 'required:false, eg:lender')   
			              
			   .end();

function service(data){

	var d = q.defer();
	
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;

		if (params.type !== 'borrower' && params.type !== 'lender') throw new Error("Unsupported profile type: " + params.type);
        if (params.type === 'borrower' && params.parent_lender_id === undefined) throw new Error("A borrower must have a lender. Pass `parent_lender_id` as a parameter");
        return [models.profile.findOne({
            where: {
                type: params.type, 
                user_id: params.user_id,
            }
        }), params];

        
	}) 
	.spread((profile, params) => { 
        if (!profile)  {
            params.created_on = new Date();
            return models.profile.create({...params});
        }
        else throw new Error("User already has the specified profile type")
    }).then((profile)=>{
        if (!profile) throw new Error("An error occured while creating user's profile");        
        d.resolve("Successfully created user's profile");
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
