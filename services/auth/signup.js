const models = require('mlar')('models');
const morx = require('morx'); 
const q = require('q'); 
const bcrypt = require('bcrypt'); 
const validators = require('mlar')('validators'); 
const obval = require('mlar')('obval'); 
const assert = require('mlar')('assertions'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const axios = require('axios');
const config = require('../../config');
const makeRequest = require('mlar')('makerequest');

var spec = morx.spec({}) 
			   .build('first_name', 'required:false, eg:Tina')   
               .build('last_name', 'required:false, eg:Braxton') 
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
        
        
        let role = await models.role.findAll({where: {id: params.type }});
        if (!role) throw new Error("No such role exists")
        
        assert.emailFormatOnly(params.email);  // validate email, throw error if it's some weird stuff
        
        assert.mustBeValidPassword(params.password);

        // make request to verify phone number
        const verifiedPhone = await makeRequest(
            config.utility_base_url + 'verify/phone/',
            'POST',
            { phone: params.phone },
            requestHeaders,
            'Phone validation'
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
        
        if (role.name == "individual_lender" && !(params.first_name && params.last_name)) 
            throw new Error("Individual accounts must have a first and last name");

        if (role.name == "business_lender" && params.business_name == undefined) 
            throw new Error("Business accounts must have a business name");
        
        
        // hash password
        params.password = await bcrypt.hash(params.password, 10);
        
        return [ models.user.findOne({
            where: {
                email: params.email
            }
        }), params, role]
	}) 
	.spread((user, params, role) => { 
        if (user) throw new Error("User with this email already exists");
        
        // make user active from the get-go
        params.active = 1;
        params.created_on = new Date();

        // role_id is the type passed from frontend 
        params.role_id = params.type;  delete params.type;

        return models.sequelize.transaction((t1) => {
            return q.all([
                models.user.create(params, {transaction: t1}), 
                models.profile.create({role_id: params.role_id}, {transaction: t1})
            ]);
        })
        
    }).spread(async (user, profile)=>{
        if (!user) throw new Error("An error occured while creating user's account");
        if (!profile) throw new Error("Could not create a profile user")
        await profile.update({user_id: user.id})
        
        let fullname = user.type == 'business' ? user.business_name : user.first_name + ' ' + user.last_name;
        // send email 
        const payload= {
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
        
        d.resolve(user);
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
