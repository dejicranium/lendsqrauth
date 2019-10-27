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
const moment = require('moment')

var spec = morx.spec({}) 
			   .build('email', 'required:true, eg:itisdeji@gmail.com')   
               
			   .end();

function service(data){

	var d = q.defer();
	
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		let params = validParameters.params;
        
        
        assert.emailFormatOnly(params.email);  // validate email, throw error if it's some weird stuff
        
        return [ models.user.findOne({
            where: {
                email: params.email
            }
        }), params]
	}) 
	.spread((user, params) => { 
        if (!user) throw new Error(`User with email ${params.email} was not found`);
        
        return crypto.randomBytes(32).toString('hex');
        
    }).then((randomBytes)=>{
        if (!randomBytes) throw new Error("An error occured while carrying out this operation");
        
        return [models.auth_token.findOne({where: {
            id: 1,
            type: 'password_reset',
        }}), randomBytes];

    }).spread((usertoken, token) => {
        // store as auth token and set expiry to 10 minutes from now
        let expiry = moment(new Date()).add(15, 'minutes');
        
        if (!usertoken) return models.auth_token.create({type: 'password_reset', user_id: 1, token: token, expiry: expiry})
        return usertoken.update({
            token: token, 
            expiry: expiry
        })
    }).then(tokencreated=> {
        if (!tokencreated) throw new Error("An error occured please try again");
        d.resolve(tokencreated.token);
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
