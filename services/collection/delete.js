const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions');
const AuditLog = require('mlar')('audit_log');

var spec = morx.spec({}) 
			   .build('collection_id', 'required:true, eg:1')   
			   .end();

function service(data){

	var d = q.defer();
	const globalUserId = data.user.id || 1
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;
        return [models.collection.findOne({
            where: {
                id: params.collection_id
            },
            include: [
                {
                    model: models.product,
                    required: false
                }
            ]
        }), params]
        
	}) 
	.spread((collection, params) => { 
        if (!collection) throw new Error("No collection found");
        if(data.profile.id !== collection.lender_id) throw new Error("You can't delete a collection that you didn't create");
        params.deleted_flag = 1;
        params.deleted_on = new Date();
        params.deleted_by = globalUserId;

        return collection.update({...params})
    }).then(async (collection)=>{
        if (!collection) throw new Error("An error occured while deleting collection");

        //audit log
        let audit = new AuditLog(data.reqData, "DELETE", "Deleted collection " + collection.id);
        await  audit.create();

        d.resolve("Successfully deleted collection");
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
