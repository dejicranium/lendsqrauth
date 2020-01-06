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
			   .build('name', 'required:false, eg:1')   
			   .end();

function service(data){

	var d = q.defer();
	const page = data.page ? Number(data.page) : 1;
	const limit = data.limit ? parseInt(data.limit) : 20;
	const offset = page ? (page - 1) * limit : false;	




	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		
		let params = validParameters.params;
		let selection = { where: {inviter: data.profile.id }, attributes: {exclude: ['token']} }


        return models.user_invites.findAndCountAll(selection)

		
    })

    .then(invites=> {

        if (!invites) d.resolve([]);
        
        d.resolve(paginate(invites.rows, 'invites', invites.count, limit, page));        


    })
    .catch(err=> {
        d.reject(err);
    })

    return d.promise;
		

}
service.morxspc = spec;
module.exports = service;
