const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 
const paginate = require('mlar')('paginate');

var spec = morx.spec({})  
			   .end();

function service(data){

	const d = q.defer();
	const filter = data.filter;

	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;
        
        return models.profile.findOne({
            where: {
                id: data.profile.id
            },
            attributes: ['id', 'role_id', 'user_id', 'parent_profile_id']
        })
	}) 
	.then((profile) => { 
        if (!profile)  throw new Error("Profile not found")
        d.resolve(profile)
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
