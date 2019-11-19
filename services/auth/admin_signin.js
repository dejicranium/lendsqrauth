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
	.spread(async (user, params) => { 
        if (!user) throw new Error("Invalid credential(s)");
        
        // check the user's profiles to see whether he has an admin profile.
        let admin_role = await models.role.findOne({where: {name: 'admin'}});
        let user_admin_profile = models.profile.findOne({where: {user_id: user.id, role_id: admin_role.id }})

        return [user_admin_profile, user, bcrypt.compare(params.password, user.password)]

         
        // deciper password 
        //return [user ,bcrypt.compare(params.password, user.password)]
        
    }).spread(async (profile, user, password)=>{
        if (!profile) throw new Error("User is not an admin");
        if (!password) throw new Error("Invalid credential(s)");
        
        let permissions =  await models.sequelize.query(`
        SELECT p.name as name from permissions as p INNER JOIN entity_permissions AS ep ON p.id = ep.permission_id WHERE  (ep.entity = 'role' AND ep.entity_id = ${profile.role_id} ) OR (ep.entity = 'profile' AND ep.entity_id = ${profile.id}) `
        )
        

        let user_permissions = [];

        if (permissions && permissions[0] && permissions[0]) {
            user_permissions = permissions[0].map(perm=> perm.name);
        }
       
        let newToken = await jwt.sign(
            {   
                id: profile.id,
                email: user.email, 
                user_id: user.id, 
                role: 'admin',
                permissions: user_permissions
            }, 
            config.JWTsecret, {expiresIn: config.JWTexpiresIn
            }
        )

        // we need to create a profile token, 
        // first check whether one exists for a user 
        let profile_token = await models.auth_token.findOne({ where: {user_id: user.id, type: 'profile_token'}})
        
        if (profile_token && profile_token.user_id) {
            // update existing token
            await profile_token.update({
                token: newToken,
            })
            
        }
        else {
            // create a new one 
            await models.auth_token.create({
                type: 'profile_token',
                token: newToken,
                user_id: user.id,
                is_used: 0
            })
        }
        return [user,  profile_token, models.auth_token.findOne({ where: {  type: 'session', user_id: user.id}})]
    })
    .spread(async (user, profile_token, token) => {
        if (user.disabled) throw new Error("User is disabled")
        else if (user.deleted) throw new Error("Account has been deleted")            
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
        return  [user,  profile_token, token.update({
            token: newToken,
            is_used: 0
        })]
        

    }).spread( (user, profile_token, token)=> {
        if (!token) throw new Error("Could not create new token");
        let fields = "id,first_name,last_name,phone,email,business_name,active,deleted,disabled,type,subtype".split(',')
        
        let response = {};
        user = obval.select(fields).from(user);
        response.user = user;
        response.access_token = token.token;
        response.profile_token = profile_token.token
        d.resolve(response)
    })
	.catch( (err) => {
		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;