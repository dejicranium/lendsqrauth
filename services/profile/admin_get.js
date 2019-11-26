const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 
const paginate = require('mlar')('paginate');

var spec = morx.spec({}) 
			   .build('profile_id', 'required:false, eg:1')   
			   .build('user_id', 'required:false, eg:1')   
			   //.build('type', 'required:false, eg:lender')   
			    
			              
			   .end();

function service(data){

	const d = q.defer();
	const filter = data.filter;

	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;
    
        if (params.profile_id) {

            return [models.profile.findOne({
                where: {
                    id: params.profile_id, 
                },
                include: [{
                    model: models.business_info}]
            }), data];
    
        }
        

        const page = data.page ? Number(data.page) : 1;
        const limit = data.limit ? Number(data.limit) : 20;
        const offset = page ? (page - 1) * limit : false;	
        
        data.limit = limit;
        data.offset = offset;

        data.where = {
            user_id: params.user_id
        }
        return [models.profile.findAndCountAll(data), data];
    

        
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
