const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const bcrypt = require('bcrypt'); 
const validators = require('mlar')('validators'); 
const obval = require('mlar')('obval'); 
const assert = require('mlar')('assertions'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;

var spec = morx.spec({}) 
			   .build('lendi_auth_token', 'required:true, eg:xxxxxererw')   
			   .end();

function service(data){

	var d = q.defer();
	const globalUserId = data.USERID;
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;
        
        return models.auth_token.destroy({
            where: {
                user_id: globalUserId,
                type: 'session',
                token: params.lendi_auth_token,
            }
        }, {force: true})
	}) 
	.then((deleted) => { 
        if (!deleted) throw new Error("User not logged in");
        d.resolve("Log out successful")
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;