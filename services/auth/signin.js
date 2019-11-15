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
        if (!user) throw new Error("Invalid credentials");
        
        // deciper password 

        return [user ,bcrypt.compare(params.password, user.password)]
        
    }).spread((user, password)=>{
        if (!password) throw new Error("Invalid credentials");
        return [user,  models.auth_token.findOne({ where: {  type: 'session', user_id: user.id}})]
    
        
    })
    .spread(async (user, token) => {
        if (user.disabled) throw new Error("User is disabled")
        else if (user.deleted) throw new Error("User's account has been deleted")            
        else if (!user.active && !user.disabled && !user.deleted) throw new Error("User is inactive");
        let newToken = await jwt.sign({email: user.email, user_id: user.id, subtype: user.subtype}, config.JWTsecret, {expiresIn: config.JWTexpiresIn})

        if (!token) {
            // create and store token
            return[ user, models.auth_token.create({
                type: 'session',
                token: newToken,
                user_id: user.id,
            }) ]

        }
        return  [user,  token.update({
            token: newToken,
            is_used: 0
        })]
        

    }).spread( (user, token)=> {
        if (!token) throw new Error("Could not create new token");
        let fields = "id,first_name,last_name,phone,email,business_name,active,deleted,disabled,type,subtype".split(',')
        
        let response = {};
        user = obval.select(fields).from(user);
        response.user = user;
        response.token = token.token;

        d.resolve(response)
    })
	.catch( (err) => {
		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
