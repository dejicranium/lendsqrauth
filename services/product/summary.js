const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 

var spec = morx.spec({}) 			              
			   .end();

function service(data){

	var d = q.defer();
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;


        let draftProduct = models.product.findAndCountAll({limit:1, where: {status: "draft"}})
        let totalProduct = models.product.findAndCountAll({limit:1})
        let inactiveProduct = models.product.findAndCountAll({limit:1, where: {status: "inactive"}})
        let activeProduct = models.product.findAndCountAll({limit:1, where: {status: "active"}})
        let deactivatedProduct = models.product.findAndCountAll({limit:1, where: {status: "deactivated"}})

        return [draftProduct, totalProduct, inactiveProduct, activeProduct, deactivatedProduct];
        
	}) 
	.spread((draft, total, inactive, active, deactivated) => { 
        
        draft = draft.count;
        total = total.count;
        inactive = inactive.count;
        active = active.count;
        deactivated = deactivated.count;
       

        d.resolve({
            draft,
            total,
            inactive,
            active,
            deactivated
        });
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
