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
	const page = data.page ? Number(data.page) : 1;
    const limit = data.limit ? data.limit : 20;
    const offset = page ? (page - 1) * limit : false;	
    
    data.limit = limit;
    data.offset = offset;

	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;
        data.where = {
			user_id: params.user_id,
			include: [{model: models.profile}]
        }
        return models.profile.findAndCountAll(data);

        
	}) 
	.then((profile) => { 
        if (!profile)  throw new Error("Profiles not found")
        d.resolve(paginate(profile.rows, 'profiles', profile.count, limit,page));
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
