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

		if (!['verify_bank_otp', 'resend_invitation'].includes(params.subtype)) {
            throw new Error("Subtype should be `verify_bank_otp` or `resend_invitation`");
        }
        if (params.email) {
            assert.emailFormatOnly(params.email);
        }
        if (params.subtype == 'verify_bank_otp' && !params.phone) throw new Error("You must provide a phone");
        if (params.subtype == 'resend_invitation' && !params.email) throw new Error("You must provide an email");
        
        const requestHeaders = {
            'Content-Type' : 'application/json',
        }

        if (params.type == 'otp') {
            let OTP = generateRandom('digits', 6);
            let token_create = await models.auth_token.findOrCreate({
                where:{ 
                    type: 'verify_bank_otp',
                    user_id: data.user_id,
                },
                defaults: {
                    token: OTP,
                    type: 'verify_bank_otp',
                    user_id: data.user_id,
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

            let url =  config.notif_base_url + "sms/send"; // notification servicer
            
            let payload = {
                recipient: params.phone,
                message: `Your OTP is ${OTP}`,
                sender_id:1
            }

            // send otp to phone;
            return makeRequest(url, 'POST', payload, requestHeaders);

        }
        else {
            // send email 
            let payload= {
                context_id: null,
                sender: config.sender_email,
                sender_id: 1,
            }

            if (params.type == 'token' && params.subtype == 'resend_invitation') {
                
                let user_invite = await models.user_invites.findOne({
                    where: {
                        inviter: data.user.id,
                        invitee: params.email
                    }
                })

                if (!user_invite) 
                    throw new Error("You haven't invited user with email: " + params.email);
                if (['accepted', 'declined'].includes(user_invite.status)) 
                    throw new Error ("Invitation already " + user_invite.status);
               
                payload.recipient = params.email;
               

                payload.context_id = 80;
                payload.recipient = params.email,
                payload.data = {
                    email: params.email,
                    name: "Uswr",
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
