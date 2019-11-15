const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 

var spec = morx.spec({}) 
				.end();

function service(data){

    var d = q.defer();
    const globalUserId = data.user_id;
	q.fcall( async () => {

		if (globalUserId) {
            return models.user_preference.findAll({
                where: {
                    user_id: globalUserId
                }
            })
        }
        return models.preference.findAll({})
	})
	.then( async (preferences) => {
		if (!preferences) throw new Error("No preferences");
		d.resolve(preferences);
	})
	.catch(error=> {
		d.reject(error)
	})
	return d.promise;

}
service.morxspc = spec;
module.exports = service;
