const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions');
const AuditLog = require('mlar')('audit_log');

var spec = morx.spec({}) 
				.build('name', 'required:false')
				.build('for', 'required:false')
				.build('preference_id', 'required:false')
				.build('preference_value', 'required:false')
				.end();

function service(data){

	var d = q.defer();
	const globalUserId = data.USER_ID;
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;

		if (params.for == 'user') {
			if(!params.preference_value) throw new Error("Please provide a preference value")
			if(!params.preference_id) throw new Error("Please provide a preference id")
			let user_preference = await models.user_preference.findOrCreate({
				where: {
					user_id: globalUserId,
					preference_id: params.preference_id,
				},

				defaults: {
					user_id: globalUserId,
					preference_id: params.preference_id,
					preference_value: params.preference_value
				}

				
			})
			// if user_prefrence not created 
			if (!user_preference[1]) {
				user_preference[0].update({
					preference_value: params.preference_value
				})
			}
			d.resolve("Preference set")
		}
	
		return [
			models.preference.findOrCreate({
				where: {
					name: params.name,
				},
				defaults: {
					name: params.name,
					created_on: new Date(),
					created_by: globalUserId
				}
			}),
			params
		]
	})
	.spread( async (preference, params) => {
		if (!preference) throw new Error("Could not create preference");

		let audit = new AuditLog(data.reqData, "CREATE", "created preference " + preference.id);
		await audit.create();

		d.resolve(preference[0]);
	})
	.catch(error=> {
		d.reject(error)
	})
	return d.promise;

}
service.morxspc = spec;
module.exports = service;
