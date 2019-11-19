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
const paginate = require('mlar')('paginate');




var spec = morx.spec({}) 
			   .build('permission_id', 'required:false, eg:1')   
			   .build('profile', 'required:false, eg:1')   
			   .build('name', 'required:false, eg:1')   

function service(data){

	var d = q.defer();
	const page = data.page ? Number(data.page) : 1;
	const limit = data.limit ? parseInt(data.limit) : 20;
	const offset = page ? (page - 1) * limit : false;	

	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		
		let params = validParameters.params;
		
		let selection = {
			where: {

			}
		}

		if (params.fetch_one) {
			selection.where.id = params.permission_id;
			return [
				models.permission.findOne(selection), 'one'
			]

		}
		
		// to get the permissions of a profile
		if (params.profile) {

			return [
				models.entity_permission.findAll(
					{ 
						where:
						{ 
							entity: 'profile', entity_id: params.profile
						},
						attributes: ['id', 'created_on', 'modified_on'], 
						include: [
							{ 
								model: models.permission,
								attributes: ['id', 'name', 'description'] 
							}]
					}),

				'many'
			]
		}

		if (params.name) {
			selection.where.name = data.name;
		}
		return [
			models.permission.findAndCountAll(selection),
			'many'
		]
	}) 
	.spread((permission, number) => { 
        if (!permission) throw new Error(`Permission does not exist`);
		if (number == 'many') {
			d.resolve(paginate(permission.rows, 'permissions', permission.count, limit, page));        
		}

		d.resolve(permission);
    
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
