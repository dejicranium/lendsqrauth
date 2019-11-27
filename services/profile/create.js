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
			   .build('bvn', 'required:false, eg:1')   
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

		return [models.role.findOne({where: {id: params.role_id}}), params];
	})
	.spread( async (role, params) => {
		if (!role) throw new Error("Could not find role");
		
		if (role.name == 'borrower' || role.name == 'collaborator' || role.name == 'admin') {
			// see if user already had a borrower profile
			throw new Error(`Can't register as ${role.name}`);
		}

		if (role.name == 'individual_lender') {
			let individualLenderProfile = await models.profile.findOne({
				where: {
					user_id : params.user_id,
					role_id: role.id
				}
			})

			if (individualLenderProfile) throw new Error("Cannot have more than one individual lender profile");
			
		}
		

		if (role.name == 'business_lender') {
			let business_lender_profile = await models.profile.findOne({
				where: {
					user_id : params.user_id,
					role_id: role.id
				}
			})

			if (business_lender_profile) throw new Error("Cannot have more than one business lender profile");
			
		}

		params.created_on = new Date();
	
        return [models.profile.create({...params}), params, role];
	})
	.spread(async (profile, params, role)=> {
		if (!profile) throw new Error("An error occured while creating user's profile");    
		params.profile_id = profile.id
		if (role.name=="business_lender") {
			await models.business_info.create(params);
		}
		
		
		if (params.contact_first_name || params.contact_last_name || params.contact_phone || params.contact_email ){
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
