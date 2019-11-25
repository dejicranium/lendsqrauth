const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 
const profile_middleware = require('mlar')('profileVerifyMiddleware');


var spec = morx.spec({}) 
			   .build('product_id', 'required:true, eg:lender')   
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
        if (data.profile.id !== product.profile_id) throw new Error("Can't delete another profile's product")

        if (product.deleted_flag === 0) throw new Error("Product has already been deleted");
        if (product.status === 'active') throw new Error("Cannot delete active product");


        // set modification details
        params.deleted_flag = 1;
        params.deleted_on = new Date();
        params.deleted_by = globalUserId;

        return product.update({...params})
    }).then((product)=>{
        if (!product) throw new Error("An error occured while deleting product");        
       
        d.resolve("Successfully deleted product");
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
