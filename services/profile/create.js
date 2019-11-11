const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 

var spec = morx.spec({}) 
			   .build('role_id', 'required:true, eg:1')   
			   .build('user_id', 'required:true, eg:1')   
			   .build('parent_profile_id', 'required:false, eg:1')   
			   .build('url', 'required:false, eg:lender')   
			   .build('business_logo', 'required:false, eg:lender')   
			   .build('business_name', 'required:false, eg:lender')   
			   .build('business_phone', 'required:false, eg:lender')   
			   .build('rc_number', 'required:false, eg:lender')   
			   .build('certificate_of_incorporation', 'required:false, eg:lender')   
			   .build('tin_number', 'required:false, eg:lender')   
			   .build('state', 'required:false, eg:lender')   
			   .build('country', 'required:false, eg:lender')   
			   .build('contact_first_name', 'required:false, eg:lender')   
			   .build('contact_last_name', 'required:false, eg:lender')   
			   .build('contact_phone', 'required:false, eg:lender')   
			   .build('contact_email', 'required:false, eg:lender')   
			   .build('contact_role', 'required:false, eg:lender')   
			   .build('support_email', 'required:false, eg:lender')   
			   .end();

function service(data){

	var d = q.defer();
	
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;

		let roleSelectionParams = {
			where: {
				id: params.role_id
			}
		}

		return [models.role.findOne(roleSelectionParams), params];
	})
	.spread( async (role, params) => {
		if (role && role.name == 'borrower') {
			// see if user already had a borrower profile
			let userBorrowerProfile = await models.profile.findOne({
				where: {
					user_id : params.user_id,
					role_id: role.id
				}
			})

			if (userBorrowerProfile) throw new Error("Can't have more than one profile with role `borrower`");
		}


		params.created_on = new Date();
	
        return [models.profile.create({...params}), params];
	})
	.spread(async (profile, params)=> {
		if (!profile) throw new Error("An error occured while creating user's profile");    
		
		if (params.contact_first_name || params.contact_last_name || params.contact_phone || params.contact_email ){
			params.profile_id = profile.id
			await models.profile_contact.create(params)
		} 
        d.resolve("Successfully created user's profile");
	})
	.catch(error=> {
		d.reject(error)
	})
	return d.promise;

}
service.morxspc = spec;
module.exports = service;
