const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 
const paginate = require('mlar')('paginate');

var spec = morx.spec({}) 
		.build('user_id', 'required:true, eg:1')   
		.end();

function service(data){

	var d = q.defer();
	/*
	const page = data.page ? Number(data.page) : 1;
    const limit = data.limit ? Number(data.limit) : 20;
    const offset = page ? (page - 1) * limit : false;	
    
    data.limit = limit;
    data.offset = offset;
*/
	
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;
		
		// if the request user id the same as the user whose profile wants to be seen?
		if (data.user.id != params.user_id) {
			// check whether user is an admin
			// if she is not, quickly disable her from seeing profile;
			if (data.profile.role_id !== 1) {
				throw new Error("Unauthorized access");
			}

		} 
		data.where = {
			user_id: params.user_id,
		}

		

		data.attributes = {
			exclude : [
				'role_id'
			]
		}

		data.include = [
			{
				model: models.role
			}
		]
		
        return models.profile.findAll(data);

        
	}) 
	.then((profiles) => { 
        if (!profiles)  throw new Error("No profile found")
        //d.resolve(paginate(profile.rows, 'profiles', profile.count, limit,page));
		d.resolve(profiles)
	})
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
