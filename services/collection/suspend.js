const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 

var spec = morx.spec({}) 
			   
			   .build('collection_id', 'required:true, eg:1')   
			              
			   .end();

function service(data){

	var d = q.defer();
	const globalUserId = data.USER_ID || 1;
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;

        if (params.collection_id) {
            return [ models.collection.findOne({
                where: {
                    id: params.collection_id
                }
            }), params]
    
        }

        
	}) 
	.spread((collection, params) => { 
        if (!collection) throw new Error("No such collection");
       
        params.status = 'suspended';
        // set modification details details
        params.modified_on = new Date();
        params.modified_by = globalUserId;

        d.resolve(collection.update({loan_status: 'suspended'}));
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
