const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 

var spec = morx.spec({}) 
			   .build('lender_id', 'required:false, eg:1')   
			   .build('borrower_id', 'required:false, eg:1')   
			   .build('comment', 'required:true, eg:nothing')   
			   .build('collection_id', 'required:true, eg:1')   
			   .build('schedule_id', 'required:true, eg:1')   
			   .build('amount_paid', 'required:false, eg:10000')   
			   .build('date_paid', 'required:true, eg:2019-10-10')   
			   
			              
			   .end();

function service(data){

	var d = q.defer();
	const globalUserId = data.USER_ID || 1;
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;
        
        if (!params.lender_id && !params.borrower_id) throw new Error("Lender or Borrower ID must be provided")
        
        return [ models.collection.findOne({where: {id: params.collection_id}}), models.collection_debit_schedule.findOne({where: {id: params.schedule_id}}), params ];
	}) 
	.spread((collection, schedule, params) => { 
        if (!collection) throw new Error("No such collection");
        if (!schedule) throw new Error("No such schedule");
    
        // set modificaion details details
        params.modified_on = new Date();
        let updateData = {
            comment: params.comment,
            date_paid: params.date_paid,
            amount_paid: params.amount_paid,
            borrower_id: params.borrower_id
        }

        if (params.lender_id) {
            updateData.lender_acknowledged_payment = 1;
        }
        else if (params.borrower_id) {
            updateData.borrower_acknowledged_payment = 1;
        }

        return schedule.update( updateData)

    
    }).then((schedule)=>{
        if (!payment_request) throw new Error("An error occured while carrying out this operation");        
        d.resolve(schedule);
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
