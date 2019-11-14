const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const bcrypt = require('bcrypt'); 
const validators = require('mlar')('validators'); 
const obval = require('mlar')('obval'); 
const assert = require('mlar')('assertions'); 
const crypto = require('crypto');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const moment = require('moment');
const paginate = require('mlar')('paginate');

var spec = morx.spec({}) 
			   .build('lender_id', 'required:false,eg:1')   
			   .build('product_id', 'required:false,eg:1')   
			   .end();

function service(data){

	var d = q.defer();
	
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
        let params = validParameters.params;
        

        // get by lender_id
        if (params.lender_id){
            const page = data.page ? Number(data.page) : 1;
            const limit = data.limit ? Number(data.limit) : 20;
            const offset = page ? (page - 1) * limit : false;	
            
            data.limit = limit;
            data.offset = offset;
            
            // selection for lender id
            data.where = {
                lender_id: params.lender_id
            }
            return [ models.product.findAndCountAll(data), data];
        }

        // filter by product - id : returns an object
        else if (params.product_id) {
            data.fetch_one = true;
            return [
                models.product.findOne(data), data
            ]
        }

        // else get all products in the system
        return [
            models.product.findAndCountAll(data), data
        ]
         
	}) 
	.spread((products, data) => { 
        if (!products) throw new Error("No products to show");
        
        if (data.fetch_one !== undefined) {
            d.resolve(products);
        }
        
        d.resolve(paginate(products.rows, 'products', products.count, data.limit, data.page));
    })
	.catch( (err) => {
		d.reject(err);
	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
