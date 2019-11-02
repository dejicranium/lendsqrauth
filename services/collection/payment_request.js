const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 

var spec = morx.spec({}) 
			   .build('accept_payment', 'required:true, eg:1')   
			   .build('comment', 'required:false, eg:nothing')   
			   .build('collection_id', 'required:true, eg:nothing')   
			   .build('borrower_id', 'required:true, eg:nothing')   
			   
			              
			   .end();

function service(data){

	var d = q.defer();
	const globalUserId = data.USER_ID || 1;
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;

        return [ models.collection.findOne({where: {id: params.collection_id}}), models.collection_payment_requests.findOne({where: {collection_id: params.collection_id, borrower_id: params.borrower_id}}), params ];
	}) 
	.spread((collection, payment_requests, params) => { 
        if (!collection) throw new Error("No such collection");
        
        if (payment_requests) throw new Error("Payment request exists and has already been acted upon");
        
        if (params.accept_payment) params.status = 'accepted';
        else params.status = 'rejected';

        // set creation details
        params.created_on = new Date();
        params.modified_on = new Date();
        params.created_by = globalUserId;

        return  models.collection_payment_requests.create( {
            rejection_reason: params.comment,
            status: params.status,
            collection_id: params.collection_id,
            borrower_id: params.borrower_id
        })

        // send email



        // send email to
    }).then((payment_request)=>{
        if (!payment_request) throw new Error("An error occured while carrying out this operation");        
        d.resolve("Payment request status changed successfully");
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
