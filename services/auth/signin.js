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

var spec = morx.spec({}) 
               .build('password', 'required:true, eg:tinatona98') 
               .build('email', 'required:true, eg:tinaton@gmail.com') 
			   .end();

function service(data){

	var d = q.defer();
	
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		let params = validParameters.params;
        
        
        assert.emailFormatOnly(params.email);  // validate email, throw error if it's some weird stuff
        
        return [ models.user.findOne({ where: {  email: params.email}}), params]
	}) 
	.spread((user, params) => { 
        if (!user) throw new Error("No such email exists");
        
        // deciper password 

        return bcrypt.compare(params.password, user.password)
        
    }).then((user)=>{
        if (!user) throw new Error("Password is incorrect");
       
        return [user, jwt.sign(
            {
                email: user.email,
                user_id: user.id,
            },
            config.JWTsecret,
            {expiresIn: config.JWTexpiresIn})
        ]
    
        
    })

    .spread((user, token) => {
        if (user.disabled) throw new Error("User is disabled")
        if (user.deleted) throw new Error("User account has been deleted")
        let response = {}
        response.email = user.email;
        response.token = token;
        d.resolve(response)
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
