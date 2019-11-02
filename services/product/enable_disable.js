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
        if (!product) throw new Error("No product found");
        if (product.deleted_flag == 0) throw new Error("Product no longer exits");
        if (product.status === 'active') throw new Error("Cannot update active product");
        if (product.status === 'active') throw new Error("Cannot update active product");
        if(product.status === true) params.status == 'active';
        else  params.status == 'deactivated';

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
