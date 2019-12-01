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
const config = require('../../config');
const makeRequest = require('mlar')('makerequest');
const generateRandom = require('mlar')('testutils').generateRandom;

var spec = morx.spec({}) 
			   .build('email', 'required:false')   
			   .build('phone', 'required:false')   
			   .build('type', 'required:true')   
			   .build('subtype', 'required:true')   
			   .build('user_id', 'required:false')   
			   .build('email', 'required:false')   
			   .end();

function service(data){

	var d = q.defer();
    let globalUserId = '';
    
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		let params = validParameters.params;
    
		if (params.type !== 'otp' && params.type !== 'token') {
            throw new Error("Type can be `otp` or `token` only");
        }

		if (params.subtype !== 'user_activation' && params.subtype !== 'password_reset' && params.subtype !== 'verify_bank_otp') {
            throw new Error("Subtype should be `user_activation` or `password_reset` or `verify_bank_otp` ");
        }

        if (params.subtype == 'user_activation' && !params.email) throw new Error("You must provide an email");
        if (params.subtype == 'password_reset' && !params.email) throw new Error("You must provide an email");
        
        if (params.type == 'otp' && params.subtype == 'verify_bank_otp' && !params.phone) throw new Error("You must provide a `phone`")
        if (params.type == 'otp' && params.subtype == 'verify_bank_otp' && !params.user_id) throw new Error("You must provide a `user_id`")
        
        const requestHeaders = {
            'Content-Type' : 'application/json',
        }

        if (params.type == 'otp') {
            let OTP = generateRandom('digits', 6);
            let token_create = await models.auth_token.findOrCreate({
                where:{ 
                    type: 'verify_bank_otp',
                    user_id: params.user_id,
                },
                defaults: {
                    token: OTP,
                    type: 'verify_bank_otp',
                    user_id: params.user_id,
                    is_used: false,
                    expiry: moment(new Date()).add(10, 'minutes')     
                }
            })
            if (!token_create[1]) {  // if token was not created, it exists , so go ahead and update
                token_create[0].update({
                    token: OTP,
                    expiry: moment(new Date()).add(20, 'minutes'),
                    is_used: 0     
                })
            }

            // send otp to phone;
            let url =  config.notif_base_url + "sms/send";
            
            let payload = {
                recipient: params.phone,
                message: `Your OTP is ${OTP}`,
                sender_id:1
            }

            return makeRequest(url, 'POST', payload, requestHeaders);

        }
        else {

            // send email 
            let payload= {
                context_id: null,
                sender: config.sender_email,
                sender_id: 1,
                
            }

            if (params.type == 'token' && params.subtype == 'user_activation') {
                // see whether user exists

                let user = await models.user.findOne({ where: {email: params.email}});
                if (!user.email) throw new Error("No such user found");

                // check if user is already active.
                if (user.active) throw new Error("User is already active");

                let fullname =  user.business_name ||  user.first_name + ' ' + user.last_name;
                
                payload.recipient = user.email;
                payload.data = {
                    email: user.email,
                    name: fullname,
                }
                payload.context_id = 81;

                // create activation token
                const userToken = await crypto.randomBytes(32).toString('hex');

                const token = await models.auth_token.findOrCreate({
                    where: {
                        user_id: user.id,
                        type: 'user_activation'
                    },
                    defaults: {
                        user_id: user.id,
                        type: 'user_activation',
                        token: userToken,
                        is_used: 0,
                    }
                });

                // if token type already existed for user
                if (!token[1]) {
                    // update token record  - no two tokens of the same type for a user
                    await token[0].update({
                        token: userToken,
                        is_used: 0
                    });
                }

                payload.data.token = userToken;
            }

            else if (params.type == 'token' && params.subtype == 'password_reset') {
                let user = await models.user.findOne({where: {email: params.email}});
                if (!user.email) throw new Error("No such user exists");
                let fullname =  user.business_name  || user.first_name + ' ' + user.last_name;
                
                let randomBytes = await crypto.randomBytes(32).toString('hex');

                let password_token = await models.auth_token.findOrCreate(
                    {
                        where: { type: 'password_reset', user_id: user.id },
                
                        defaults:  {
                            token: randomBytes,
                            expiry: moment(new Date()).add(20, 'minutes'),
                            is_used: false
                        }
                    }
                )

                if (!password_token[1]) {
                    await password_token[0].update({
                        token: randomBytes,
                        expiry: moment(new Date()).add(20, 'minutes'),
                        is_used: false
                    })
                }

                payload.context_id = 80;
                payload.recipient = user.email,
                payload.data = {
                    email: user.email,
                    name: fullname,
                    url: `https://lendsqr.com/reset/password?token=${randomBytes}&u_id=${user.id}`,
                    token: randomBytes
                }
            }

            const url = config.notif_base_url + "email/send";
            
            return makeRequest(url, 'POST', payload, requestHeaders);
            
        }
        
	}) 
	.then(async (auth_token) => { 
        if (!auth_token) throw new Error("Could not resend token");
        d.resolve(auth_token);
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
