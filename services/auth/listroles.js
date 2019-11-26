const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const bcrypt = require('bcrypt'); 
const validators = require('mlar')('validators'); 
const obval = require('mlar')('obval'); 
const assert = require('mlar')('assertions'); 
const jwt = require('jsonwebtoken'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const config = require('../../config');
const paginate = require('mlar')('paginate');
const spec = morx.spec({})
                .build('page', 'required:false')               
                .build('limit', 'required:false')               
                .build('offset', 'required:false')               
                .build('name', 'required:false')               
			    .end();

function service(data){
    const result = morx.validate(data, spec, {throw_error: true});
    data = result.params;

	const d = q.defer();
    const page = data.page ? Number(data.page) : 1;
    const limit = data.limit ? parseInt(data.limit) : 20;
    const offset = page ? (page - 1) * limit : false;	
    
    data.limit = limit;
    data.offset = offset;

    data.where = {
        
    }

    q.fcall( async () => {

        if (data.name) {
            data.where.name = { $like : '%' + data.name  +  '%' };
            delete data.name;
        }

        data.attributes = ['name']

        return models.role.findAndCountAll(data)
	}) 
	.then((roles) => { 
        if (!roles) throw new Error("Couldn't fetch roles");
        d.resolve(paginate(roles.rows, 'roles', roles.count, limit, page))
    })
	.catch( (err) => {
		d.reject(err);
	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
