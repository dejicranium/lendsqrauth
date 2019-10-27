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
			   .build('first_name', 'required:false, eg:Tina')   
               .build('last_name', 'required:false, eg:Braxton') 
               .build('password', 'required:true, eg:tinatona98') 
               .build('password_confirmation', 'required:true, eg:tinatona98') 
               .build('business_name', 'required:false, eg:Tina Comms')
               .build('email', 'required:true, eg:tinaton@gmail.com') 
               .build('phone', 'required:true, eg:0810045800') 
               .build('type', 'required:true, eg:business')
               .build('subtype', 'required:false, eg:lender')
			   .end();

function service(data){

	var d = q.defer();
	
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		let params = validParameters.params;
        
        
        assert.emailFormatOnly(params.email);  // validate email, throw error if it's some weird stuff
        
        if (validators.areMutuallyExclusive([params.password, params.password_confirmation]))
             throw new Error("Passwords do not match");

        if (params.password.length < 8) 
            throw new Error("Password cannot be less than 8 characters");
        
        if (params.type.toLowerCase() == "individual" && !(params.first_name && params.last_name)) 
            throw new Error("Individual accounts must have a first and last name");

        if (params.type.toLowerCase() == "business" && params.business_name == undefined) 
            throw new Error("Business accounts must have a business name");
        

        // hash password
        params.password = await bcrypt.hash(params.password, 10);
        
        return [ models.user.findOne({
            where: {
                email: params.email
            }
        }), params]
	}) 
	.spread((user, params) => { 
        if (user) throw new Error("User with this email already exists");
        
        return models.user.create({...params})
        
    }).then((user)=>{
        if (!user) throw new Error("An error occured while creating user's account");
        let normalizedUser = obval.exclude(DEFAULT_EXCLUDES).from(user);
        d.resolve(normalizedUser);
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
