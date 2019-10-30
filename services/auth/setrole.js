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
			   .build('role_id', 'required:true,eg:lender')   
			   .build('user_id', 'required:true,eg:1')   
			   .end();

function service(data){

	var d = q.defer();
	
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		let params = validParameters.params;
         
        return [ models.role.findOne({ where: { id: params.role_id }}), models.user.findOne({ where: { id: params.user_id }}) , params]
	}) 
	.spread((role, user, params) => { 
        if (!role) throw new Error(`Could not find role`);
        if (!user) throw new Error(`Could not find user`);
		 
		return [ models.user_role.findOne({
			where: {
				role_id: params.role_id,
				user_id: params.user_id
			}
		}), params ]

	}).spread((user_role, params)=> {

		if (!user_role) {
			return models.user_role.create({
				role_id: params.role_id,
				user_id: params.user_id
			});
		}
		
		return user_role.update({
			role_id: params.role_id,
			user_id: params.user_id
		})
		
	}).then(done=> {
		if (!done) throw new Error("Could not set user's role")
		d.resolve("Successfully set the user's role")
	})
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
