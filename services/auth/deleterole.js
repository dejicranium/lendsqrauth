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
                .build('role_id', 'required:true, eg:1')   
                .end();

function service(data){

	var d = q.defer();
	
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;
        
        

        return models.role.findOne({
            where: {
                id: params.role_id
            }
        })
	}) 
	.then(role => { 
        if (!role) throw new Error("Role does not exist");
        // soft delete
        return role.destroy({force: true});
        
    }).then((user)=>{
        if (!user) throw new Error("An error occured while deleting role");
        
        d.resolve("Successfully deleted role");
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
