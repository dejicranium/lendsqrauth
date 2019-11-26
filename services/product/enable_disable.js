const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 

var spec = morx.spec({}) 
			   .build('product_id', 'required:true, eg:lender')   
			   .build('status', 'required: true')
			   .end();

function service(data){

	var d = q.defer();
	const globalUserId = data.user.id || 1;
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;

        // verify status parameter
        if (!['active', 'deactivated', 'inactive'].includes(params.status)) throw new Error("Product must be one of active, deactivated or inactive") 
                
        // get a product
        let getProduct = models.product.findOne({
            where: {
                id: params.product_id
            }
        })

        return [getProduct, params]
        
	}) 
	.spread((product, params) => { 
        if (!product) throw new Error("No product found");

        // check if the profile who created this is the same as the person trying to accepti it.
        if (data.profile.id !== product.profile_id) throw new Error("You cannot update another profile's product")

        let p = product;

        if (params.status.toLowerCase() == 'active' && product.status !== 'active')  {
            if (p.max_tenor == null || p.product_name == null || p.product_description == null || p.repayment_method == null
                || p.repayment_model == null || p.min_loan_amount == null || p.max_loan_amount == null || p.tenor_type == null
                || p.min_tenor == null || p.max_tenor == null || p.interest_period == null || p.interest == null) {
                    
                    let required_fields = [
                        'max_tenor', 'product_name', 'product_description',
                        'repayment_method', 'repayment_model', 'min_loan_amount', 'max_loan_amount',
                        'tenor_type', 'min_tenor', 'max_tenor', 'interest_period', 'interest'
                    ]

                    let fields = Object.keys(p.dataValues);
                    let incomplete_fields = []
                    
                    fields.forEach(field => {
                        if (required_fields.includes(field) && p[field] == null) incomplete_fields.push(field)
                    });
                    
                   
                    throw new Error("Some fields are missing: " + incomplete_fields.join(', '));
                }
        }
        if (product.status === 'active') throw new Error("Cannot update active product");
        if (product.deleted_flag == 0) throw new Error("Product has been deleted");
        
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
