const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 
const paginate = require('mlar')('paginate');

/**
 * This endpoint gets a list of lenders
 * But the kindof lenders that are returned depends on the parameters passed
 * 
 */
var spec = morx.spec({}) 
			.build('type', 'required:false, eg:1')   			    
			.build('profile_type', 'required:false, eg:1')   			    
			.end();

function service(data){

	var d = q.defer();
	const page = data.page ? Number(data.page) : 1;
    const limit = data.limit ? Number(data.limit) : 20;
	const offset = page ? (page - 1) * limit : false;	
	
	data.limit = limit;
	data.offset = offset;

	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;
		
		// get the lender  role.

		if (params.type) {
			let profile_role = await models.role.findOne({where: {name: params.type}})
			
			data.where =  {
				role_id: profile_role.id
			}
			data.include = [
				{
					model: models.user, attributes: {
						exclude: ['password']
					}
				}
			]
			return models.profile.findAndCountAll(data);

		}

		// when you append profile type to the query string
		if (params.profile_type) {
			data.include = [
				{
					model: models.user, attributes: {
						exclude: ['password']
					},
				}, 
				{
					model: models.role, 
					where: {
						id: params.profile_type
					}
				}
			]
			return models.profile.findAndCountAll(data);
		}



		// get all lenders

		else {
			let lender_roles = await models.role.findAll({where: {name: {$in: ['individual_lender', 'business_lender']}}})
			lender_role_ids = lender_roles.map(role=> role.id);

			data.where = {
				role_id: { $in: lender_role_ids}
			}

			data.include = [{model: models.user, attributes: {exclude: ['password']}}];
			return models.profile.findAndCountAll(data);

		}
		

	}) 
	.then((profile) => { 

        if (!profile)  throw new Error("No profiles");
        d.resolve(paginate(profile.rows, 'profiles', profile.count, limit,page));

    })
	.catch( (err) => {
		d.reject(err);
	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
