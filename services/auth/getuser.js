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
                .build('user_id', 'required:true')               
                         
			    .end();

function service(data){
    const d = q.defer();
    const result = morx.validate(data, spec, {throw_error: true});
    data = result.params;

    const selection = {
        where: {
            id: data.user_id
        },
        attributes: {
            exclude: ['password', ...DEFAULT_EXCLUDES, 'business_name', 'active', 'deleted', 'disabled']
        }
    }

    q.fcall( async () => {
        return models.user.findOne(selection)
	}) 
	.then((user) => { 
        if (!user) throw new Error("Couldn't fetch user");
        d.resolve(user)
    })
	.catch( (err) => {
		d.reject(err);
	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
