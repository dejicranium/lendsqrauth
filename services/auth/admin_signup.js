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
			   .build('token', 'required:false, eg:Tina')   
			   .build('first_name', 'required:false, eg:Tina')   
               .build('last_name', 'required:false, eg:Braxton') 
               .build('email', 'required:false, eg:Braxton') 
               .build('password', 'required:true, eg:tinatona98') 
               .build('password_confirmation', 'required:true, eg:tinatona98') 
			   .end();

function service(data){

	var d = q.defer();
    const requestHeaders = {
        'Content-Type' : 'application/json',
    }
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		let params = validParameters.params;
        
        if (params.token !== config.admin_reg_token) throw new Error("Token disallowed");
        assert.emailFormatOnly(params.email);  // validate email, throw error if it's some weird stuff
        assert.mustBeValidPassword(params.password);
        if (params.password.length < 8) 
            throw new Error("Password cannot be less than 8 characters");

        if (params.password !== params.password_confirmation) throw new Error("Passwords do not match")
        if (params.first_name && params.first_name.length < 3) {
            throw new Error("Name cannot be less than 3 characters")
        }
        if (params.last_name && params.last_name.length < 3) {
            throw new Error("Name cannot be less than 3 characters")
        }


        let role = await models.role.findOne({where: {name: 'admin' }});
        if (!role) throw new Error("No such role exists. Change `type`");

        // hash password
        params.password = await bcrypt.hash(params.password, 10);
        
        return [ models.user.findOne({where: { email: params.email}}), params, role]
	}) 
	.spread(async (user, params, role) => { 
        if (user) throw new Error("Admin with these credentials exists");
        
        // if not exists 
       
        return models.sequelize.transaction((t1) => {
            // create a user and his profile            
            return q.all([
                models.user.create(params, {transaction: t1}), 
                models.profile.create({role_id: role.id}, {transaction: t1})
            ]);
        })
       
        
    }).spread(async (user, profile)=>{
        if (!user) throw new Error("An error occured while creating user's account");
        //if (!profile) throw new Error("Could not create a profile user")
    
        // update created profile
        if (profile) {
            await profile.update({user_id: user.id})
        }

        
       

    

        d.resolve(user);
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
