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
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;


        let draftCollections = models.collection.findAndCountAll({limit:1, where: {status: "draft"}})
        let totalCollections = models.collection.findAndCountAll({limit:1})
        let inactiveCollections = models.collection.findAndCountAll({limit:1, where: {status: "inactive"}})
        let activeCollections = models.collection.findAndCountAll({limit:1, where: {status: "active"}})
        let declinedCollections = models.collection.findAndCountAll({limit:1, where: {status: "borrower_declined"}})

        return [draftCollections, totalCollections, inactiveCollections, activeCollections, declinedCollections];
        
	}) 
	.spread((draft, total, inactive, active, declined) => { 
        
        draft = draft.count;
        total = total.count;
        inactive = inactive.count;
        active = active.count;
        declined = declined.count;
       

        d.resolve({
            draft,
            total,
            inactive,
            active,
            declined
        });
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
