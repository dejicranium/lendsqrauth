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
			   .build('entity', 'required:true,eg:role')   
			   .build('entity_id', 'required:true,eg:1')   
			   .build('permission_id', 'required:true,eg:1')   
			   .end();

function service(data){

	var d = q.defer();
	
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
        let params = validParameters.params;
        
        if (params.entity !== 'profile' &&  params.entity !== 'role') throw new Error("Entity entered is not valid. Choose either `profile` or `role`")
         
        return [ models.permission.findOne({ where: { id: params.permission_id }}), params];
	}) 
	.spread(async (permission, params) => { 
        if (!permission) throw new Error("Permission not found")

        if (params.entity == 'role') {
            let role =  await models.role.findOne({where: {id: params.entity_id}});
            if (!role) throw new Error("Role is not valid")
        }
        if (params.entity == 'profile') {
            let profile =  await models.profile.findOne({where: {id: params.entity_id}});
            if (!profile) throw new Error("Profile is not valid")
        }

        // check if this relation has already been set 
        
        return [ models.entity_permission.findOne({
            where: {...params}
        }), params ]
		 
		
	}).spread((permission, params)=> {
        if(permission) throw new Error("Permission already exists");
        params.created_on = new Date();
        return models.entity_permission.create(params);
	
	}).then(created=>  {
        if (!created) throw new Error("Could not create permission");
        d.resolve(created);
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
