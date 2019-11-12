const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 

var spec = morx.spec({}) 
				.build('status', 'required:true')
				
				.build('preference_id', 'required:true')
				.end();

function service(data){

	var d = q.defer();
	const globalUserId = data.USER_ID;
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;

        let updateData = {};

        if (params.status == 'active') updateData.display  =1 ;
        else updateData.display = 0;

        updateData.modified_by = globalUserId;

        return [ models.preference.findOne({
                where: {
                    id: params.preference_id
                }
            }),
            updateData
        ]

	})
	.spread( async (preference, updateData) => {
        if (!preference) throw new Error("Could not get preference");

        return preference.update(updateData)
	}).then(updated=> {
        if (!updated) throw new Error("Could not update preference");
        d.resolve("Updated preference successfully");
    })
	.catch(error=> {
		d.reject(error)
	})
	return d.promise;

}
service.morxspc = spec;
module.exports = service;
