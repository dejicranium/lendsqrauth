const models = require('mlar')('models');
const morx = require('morx'); 
const q = require('q'); 
const bcrypt = require('bcrypt'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 
const config = require('../../config');
const makeRequest = require('mlar')('makerequest');
const crypto = require('crypto');

var spec = morx.spec({}) 
			   .build('bvn', 'required:true, eg:Tina')   
			   .end();

function service(data){

	var d = q.defer();
    
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		let params = validParameters.params;
        
        if (process.env.NODE_ENV != 'development') throw new Error("API works only in production")
        return models.user_bank.findOne({
            where: {
                bvn: params.bvn
            }
        })

     
	}) 
	.then(async (bvn) => { 
        if (!bvn) throw new Error("No such BVN exists") 
        
        await bvn.destroy({force: true})

        d.resolve("BVN Deleted");
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
