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
        return models.role.findAll({where: {role: {$like: 'lender'}}})
    })
    .then(roles=> {

        if (!roles) d.resolve([]);
        
        d.resolve(roles);        


    })
    .catch(err=> {
        d.reject(err);
    })

    return d.promise;
		

}
service.morxspc = spec;
module.exports = service;
