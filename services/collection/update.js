const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 

var spec = morx.spec({}) 
        .build('collection_id', 'required: false')
        .build('borrower_first_name', 'required:false, eg:lender')   
        .build('borrower_last_name', 'required:false, eg:lender')   
        .build('borrower_email', 'required:false, eg:itisdeji@gmail.com')   
        .build('borrower_phone', 'required:false, eg:08100455706')   
        .build('borrower_bvn', 'required:false, eg:42341234552')   
        .build('product_id', 'required:false, eg:lender')   
        .build('tenor', 'required:false, eg:1')   
        .build('product_id', 'required:false, eg:1')   
        .build('disbursement_mode', 'required:false, eg:1000000')   
        .build('loan_status', 'required:false, eg:lender')   
        .build('disbursement_date', 'required:false, eg:lender')   
        .build('num_of_collections', 'required:false, eg:lender')   
        .build('repayment_id', 'required:false, eg:1')   
        .build('start_date', 'required:false, eg:lender') 
        .end();

function service(data){

	var d = q.defer();
	const globalUserId = data.USER_ID || 1;

	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
        const params = validParameters.params;
        
        if (params.borrower_first_name && params.borrower_first_name.length < 3)
		    throw new Error("Names must be more than 2 characters")
        
        if (params.borrower_last_name && params.borrower_last_name.length < 3)
            throw new Error("Names must be more than 2 characters")

        if (params.borrower_bvn)
            assert.digitsOnly(params.borrower_bvn, null, 'BVN')
        
        if (params.borrower_phone)
		    assert.digitsOnly(params.borrower_phone, null, 'Phone')
        
        if (params.borrower_email)
            assert.emailFormatOnly(params.borrower_email, null, 'Email')
        
        if (params.disbursement_date)
            assert.dateFormatOnly(params.disbursement_date, null, 'Disbursement Date') 
        
        if (params.start_date)
            assert.dateFormatOnly(params.start_date, null, 'Start Date') 
        
        if (params.num_of_collections) {
            assert.digitsOnly(params.num_of_collections, null, 'No. of collections') 

        }
        
        // checks the product we are assigning to
        let product = null;
        if (params.product_id) {
            await models.product.findOne({where: {id: params.product_id}})
                .then(_product=>{
                    product = _product;
                    if (!_product) throw new Error("No matching product found")
                    
                    // you cannot create loans on an inactive product
                    if (_product.status != 'active') throw new Error("You cannot create collection for an product that is not active");
                })
        }

        return [
            product,

            models.collection.findOne({
                where: {
                    id: params.collection_id
                }
            }),

            params
        ]
        
	}) 
	.spread((product, collection, params) => { 
        if (!collection) throw new Error("No such product exists");

        // you can't change a loan's product id after it has been set
        if (params.product_id && collection.product_id !== null) throw new Error("Cannot re-update product id of a created collection");
		
		//params.profile_id = data.profile.id
        params.modified_on = new Date();
		params.modified_by = globalUserId;
		
		let p = product;
		

		return product.update({...params})
		
    }).then(async (product)=>{
        if (!product) throw new Error("An error occured while creating product");        
		let p = product;
		let params = {};
		if (p.max_tenor == null || p.product_name == null || p.product_description == null || p.repayment_method == null
			|| p.repayment_model == null || p.min_loan_amount == null || p.max_loan_amount == null || p.tenor_type == null
			|| p.min_tenor == null || p.max_tenor == null || p.interest_period == null || p.interest == null) {
				params.status = 'draft';
			}
		else {
			params.status = 'inactive';
		}

		await product.update({...params});

		// see whether loan is draft or not
		//let loan_is_draft = true;

        d.resolve(product);
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
