const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 
const paginate = require('mlar')('paginate');

var spec = morx.spec({}) 
			   .build('profile_id', 'required:false, eg:1')   
			   .build('type', 'required:false, eg:lender')   
			   .end();

function service(data){

	const d = q.defer();
	const filter = data.filter;

	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;
		
		if (params.profile_id) {
			let profile_is_a_subprofile = true;
			// try to see whether the person making the request 
			// is  a parent lender and  if the profile he is trying to see is the
			// profile of one of his collaborators or borrowers
			if (data.profile.role == 'business_lender' || data.profile.role == 'individual_lender') {
				let sub_profiles = await models.profile.findAll({where: {parent_profile_id : data.profile.id}});
				
				if (sub_profiles && sub_profiles.length) {
					let sub_profiles_ids = sub_profiles.map(sub=> sub.id);
					if (!sub_profiles_ids.includes(params.profile_id)) {
						profile_is_a_subprofile = false;
					}
				}
			}
	
	
	
			let user_profiles = await models.profile.findAll({where: {user_id: data.user.id}});
			let user_profiles_ids = user_profiles.map(prof => prof.id);
	
			// check if profile of the requester is not admin 
			// and the profile being searched for is one of the profiles of the requester
			if (data.profile.role !== 'admin' && !user_profiles_ids.includes(params.profile_id) && !profile_is_a_subprofile) {
				throw new Error("You need to be an admin, own this profile or be it's parent to view it");
			}


			return [models.profile.findOne({
				where: {
					id: params.profile_id, 
				},
				include: [{
					model: models.profile_contact}]
			}), data];
		}

		if (data.profile.role !== 'admin') throw new Error("Unauthorized");

		if (filter) {
			const page = data.page ? Number(data.page) : 1;
			const limit = data.limit ? Number(data.limit) : 20;
			const offset = page ? (page - 1) * limit : false;	
			
			data.limit = limit;
			data.offset = offset;

			data.where = {
				type: params.type
			}
			return [models.profile.findAndCountAll(data), data];
		}


        
	}) 
	.spread((profile, data) => { 
        if (!profile)  throw new Error("Profile not found")
        d.resolve(filter ? paginate(profile.rows, 'profiles', profile.count, data.limit, data.page): profile);
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
