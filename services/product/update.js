const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 

var spec = morx.spec({}) 
			   .build('product_id', 'required:true, eg:lender')   
			   .build('profile_id', 'required:false, eg:lender')   
			   .build('product_name', 'required:false, eg:lender')   
			   .build('product_description', 'required:false, eg:1')   
			   .build('repayment_model', 'required:false, eg:lender')   
			   .build('repayment_method', 'required:false, eg:lender')   
			   .build('min_loan_amount', 'required:false, eg:lender')   
			   .build('max_loan_amount', 'required:false, eg:lender')   
			   .build('min_tenor_type', 'required:false, eg:lender')   
			   .build('max_tenor_type', 'required:false, eg:lender')   
			   .build('min_tenor', 'required:false, eg:lender')   
			   .build('max_tenor', 'required:false, eg:lender')   
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

		if (params.product_name && params.product_name.length > 255) throw new Error("Product name cannot be more than 255 characters");

        let getProduct = models.product.findOne({
            where: {
                id: params.product_id
            }
        })

        return [getProduct, params]
        
	}) 
	.spread((product, params) => { 
        if (!product) throw new Error("No product found");
        if(product.status == 'active') throw new Error("Cannot update active product");
        
        // set modification details
        params.modified_on = new Date();
        params.modified_by = globalUserId;

        return product.update({...params})
    }).then((product)=>{
        if (!product) throw new Error("An error occured while updating product");        
       
        d.resolve(product);
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
