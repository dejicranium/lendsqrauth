const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 

var spec = morx.spec({}) 
				.build('preference_id', 'required:true')
				.end();

function service(data){

	var d = q.defer();
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;

		
		return models.preference.destroy({where: {id: params.preference_id}}, {force: true})
	})
	.then( async (preference) => {
		if (!preference) throw new Error("Could not delete preference");
		d.resolve("Deleted preference");
	})
	.catch(error=> {
		d.reject(error)
	})
	return d.promise;

}
service.morxspc = spec;
module.exports = service;
