const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 

var spec = morx.spec({}) 
			   .build('name', 'required:true, eg:lender')   
			   .build('email', 'required:false, eg:lender')   
			   .build('mobile', 'required:false, eg:1')   
			   .build('product_id', 'required:true, eg:1')   
			   .build('tenor', 'required:false, eg:lender')   
			   .build('borrower_id', 'required:false, eg:1')   
			   .build('max_loan_amount', 'required:false, eg:lender')   
			   .build('loan_amount', 'required:true, eg:1000000')   
			   .build('loan_status', 'required:false, eg:lender')   
			   .build('repayment_id', 'required:false, eg:1')   
			   .build('start_date', 'required:false, eg:lender')   
			              
			   .end();

function service(data){

	var d = q.defer();
	const globalUserId = data.USER_ID || 1;
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;

        let getProduct = models.product.findOne({
            where: {
                id: params.product_id
            }
        })

        return [getProduct, params]
        
	}) 
	.spread((product, params) => { 
        if (!product) throw new Error("No such product");
        if (product.status != 'active') throw new Error("The product is not active");
        if (params.loan_amount < 0) throw new Error("Loan amount cannot be negative");

        // set creation details
        params.created_on = new Date();
        params.created_by = globalUserId;

        return models.collection.create({...params})
    }).then((collection)=>{
        if (!collection) throw new Error("An error occured while creating collection");        
       
        d.resolve(collection);
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
