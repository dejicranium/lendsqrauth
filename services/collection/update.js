const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 
const requests = require('mlar')('requests');
const makeRequest = require('mlar')('makerequest');
const config = require('../../config');

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
    let tenor_just_added = false;

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
        
        tenor_just_added = !collection.tenor && params.tenor
        
    

		return  collection.update({...params})
		
    }).then(async (collection)=>{
        let product =  await models.product.findOne({where: {id: collection.product_id}})
        
        if(product.id) {
            // check whether the most essential parts of a collection are available before sending email
            // if tenor is just being added
            if (tenor_just_added) {
                // set email
                let lender_identity = data.profile.business_name || data.user.first_name + ' ' + data.user.last_name
                
                let payload =  {
                    lender: lender_identity,
                    accept_url : config.base_url + 'reject-borrower-invite',
                    reject_url: config.base_url + 'accept-borrower-invite',
                    borrower: collection.borrower_name,
                    interest: product.interest,
                    interest_period: product.interest_period,
                    tenor: collection.tenor
                }
                
                await requests.inviteBorrower(collection.borrower_email, payload);

            }
        }
        
        d.resolve(collection);
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
