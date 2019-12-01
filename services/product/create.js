const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 

var spec = morx.spec({}) 
			   //.build('profile_id', 'required:true, eg:lender')   
			.build('product_name', 'required:true, eg:lender')   
			.build('product_description', 'required:false, eg:1')   
			.build('repayment_model', 'required:false, eg:lender')   
			.build('repayment_method', 'required:false, eg:lender')   
			.build('min_loan_amount', 'required:false, eg:lender')   
			.build('max_loan_amount', 'required:false, eg:lender')   
			.build('tenor_type', 'required:false, eg:lender')   
			.build('min_tenor', 'required:false, eg:lender')   
			.build('max_tenor', 'required:false, eg:lender')   
			.build('interest_period', 'required:false, eg:lender')   
			.build('interest', 'required:false, eg:lender')   
			.build('status', 'required:false, eg:lender')   
			.build('urL_slug', 'required:false, eg:lender')   
			.end();

function service(data){

	var d = q.defer();
	const globalUserId = data.USER_ID || 1;
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;
		
		if (params.max_tenor) assert.digitsOnly(params.max_tenor, null, 'max tenor')
		if (params.min_tenor) assert.digitsOnly(params.min_tenor, null, 'min tenor')
		if (params.interest) {
			assert.digitsOrDecimalOnly(params.interest, null, 'interest')
		}
		if (params.min_loan_amount) {
			assert.digitsOnly(params.min_loan_amount) 
			params.min_loan_amount = parseFloat(params.min_loan_amount).toFixed(2);

		}
		if (params.max_loan_amount) {
			assert.digitsOnly(params.max_loan_amount) 
			params.max_loan_amount = parseFloat(params.max_loan_amount).toFixed(2);
		}
		if (params.repayment_method) {
			params.repayment_method = params.repayment_method.toLowerCase();
			if (!['card', 'direct debit', 'bank transfer', 'cheque', 'cash'].includes(params.repayment_method)){
				throw new Error("Repayment method can only be card, direct debit, bank transfer, cheque or cash")
	
			}
		}
		if (params.repayment_model) {
			params.repayment_model = params.repayment_model.toLowerCase();
			if (!['equal installments', 'reducing balance'].includes(params.repayment_model)) {
				throw new Error('Repayment model can be either `equal installments` or `reducing balance`')
			}
		}
		if (params.tenor_type) {
			params.tenor_type = params.tenor_type.toLowerCase();
			if (!['days', 'weeks', 'months', 'years'].includes(params.tenor_type))
			throw new Error('Tenor type should be one of `days`, `weeks`, `months`, `years`')
		}
		if (params.interest_period) {
			params.interest_period = params.interest_period.toLowerCase();
			if (!['per day', 'per month', 'per annum', 'flat'].includes(params.interest_period))
				throw new Error('Interest period should be one of `per day`, `per month` or `per annum`')
		}
		if (params.product_name.length > 255) throw new Error("Product name cannot be more than 255 characters");
		
        let getProductName = models.product.findOne({
            where: {
                //profile_id: data.profile.id,
                product_name: params.product_name
            }
        })

        return [getProductName, params]
        
	}) 
	.spread((product, params) => { 
        if (product) throw new Error("Product name is not unique");

		// set creation details
		params.profile_id = data.profile.id
        params.created_on = new Date();
        params.created_by = globalUserId;
		
			
        return models.product.create({...params})
    }).then( async (product)=>{
        if (!product) throw new Error("An error occured while creating product");        
	   
		let p = product;
		let updateData = {};
		
		if (p.max_tenor == null || p.product_name == null || p.product_description == null || p.repayment_method == null
			|| p.repayment_model == null || p.min_loan_amount == null || p.max_loan_amount == null || p.tenor_type == null
			|| p.min_tenor == null || p.interest_period == null || p.interest == null) {
				updateData.status = 'draft';
			}
		else {
			updateData.status = 'inactive';
		}
		
		await product.update({...updateData});

        d.resolve(product);
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
