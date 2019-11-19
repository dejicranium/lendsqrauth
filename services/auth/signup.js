const models = require('mlar')('models');
const morx = require('morx'); 
const q = require('q'); 
const bcrypt = require('bcrypt'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 
const config = require('../../config');
const makeRequest = require('mlar')('makerequest');
const crypto = require('crypto');

var spec = morx.spec({}) 
			   .build('first_name', 'required:true, eg:Tina')   
               .build('last_name', 'required:true, eg:Braxton') 
               .build('password', 'required:true, eg:tinatona98') 
               .build('password_confirmation', 'required:true, eg:tinatona98') 
               .build('business_name', 'required:false, eg:Tina Comms')
               .build('email', 'required:true, eg:tinaton@gmail.com') 
               .build('phone', 'required:true, eg:0810045800') 
               .build('type', 'required:true, eg:1')
			   .end();

function service(data){

	var d = q.defer();
    const requestHeaders = {
        'Content-Type' : 'application/json',
    }
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		let params = validParameters.params;
        
        assert.emailFormatOnly(params.email);  // validate email, throw error if it's some weird stuff
        
        if (params.first_name.length < 3) {
            throw new Error("Name cannot be less than 3 characters")
        }
        if (params.last_name.length < 3) {
            throw new Error("Name cannot be less than 3 characters")
        }

        assert.mustBeValidPassword(params.password);

        let role = await models.role.findAll({where: {name: params.type }});
        if (!role) throw new Error("No such role exists. Change `type`");

        // make request to verify phone number
        const verifiedPhone = await makeRequest(
            config.utility_base_url + 'verify/phone/',
            'POST',
            { phone: params.phone },
            requestHeaders,
            'validate phone number'
        )
        
        if (verifiedPhone) {
            if (verifiedPhone.phone == undefined && verifiedPhone.countryCode == undefined) throw new Error("Phone number not valid");
        }
        if (verifiedPhone.status == 'error'){
            throw new Error("Could not validate phone number");
        }
        
        if (validators.areMutuallyExclusive([params.password, params.password_confirmation]))
             throw new Error("Passwords do not match");

        if (params.password.length < 8) 
            throw new Error("Password cannot be less than 8 characters");
    
        if (role.name == "business_lender" && params.business_name == undefined) 
            throw new Error("Business accounts must have a business name");
        
        
        // hash password
        params.password = await bcrypt.hash(params.password, 10);
        
        return [ models.user.findOne({where: { email: params.email}}), params, role]
	}) 
	.spread(async (user, params, role) => { 
        if (user) throw new Error("User with these credentials exists");
        

        // set role
        params.role_id = role.id;  delete params.type;

        params.created_on = new Date();

        return models.sequelize.transaction((t1) => {
            // create a user and his profile            
            return q.all([
                models.user.create(params, {transaction: t1}), 
                models.profile.create({role_id: params.role_id}, {transaction: t1})
            ]);
        })
        
    }).spread(async (user, profile)=>{
        if (!user) throw new Error("An error occured while creating user's account");
        if (!profile) throw new Error("Could not create a profile user")
        
        // update created profile
        await profile.update({user_id: user.id})

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
        
        let fullname =  user.business_name ||  user.first_name + ' ' + user.last_name;
        // send email 
        let payload= {
            context_id: 69,
            sender: config.sender_email,
            recipient: user.email,
            sender_id: 1,
            data:{
                email: user.email,
                name: fullname
	        }
        }

        const url = config.notif_base_url + "email/send";
        // send the welcome email 
        await makeRequest(url, 'POST', payload, requestHeaders);
        
        // prepare to send email verification email
        payload.context_id = 81;
        payload.data.token = userToken;
        await makeRequest(url, 'POST', payload, requestHeaders);

        d.resolve(user);
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
