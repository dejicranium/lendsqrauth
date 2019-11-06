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
			   .build('email', 'required:false, eg:1')   
			   .end();

function service(data){

	var d = q.defer();
	const globalProfileId = data.PROFILE_ID || 1;
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		let params = validParameters.params;
        
        // through the email, find out  whether user already exist

        return models.user.findOne({
            where:{
                email: params.email
            }
        })
		
	}) 
	.then(async (user) => { 
        if (user) {
            
            // prepare to copy the details of the user's profile into a new and change only the role_id  (should be collaborator) and parent_profile_id
            let userProfile = await models.profile.findOne({
                where: {
                    user_id: user.id
                }
            })

            // get or create the collaborator's role
            let collaboratorRole = null;
            await models.role.findOrCreate({
                where: {
                    name: 'collaborator',
                }
            }).spread((role, created)=> {
                collaboratorRole = role;
            });
            
            let collaboratorRoleId = collaboratorRole.id;
            
            // copy existing profile to new profile object
            let newProfile = {};

            let paramsToCopy = {...userProfile};
            paramsToCopy.role_id = collaboratorRoleId;
            paramsToCopy.parent_profile_id = globalProfileId;

            newProfile = paramsToCopy;

            return models.profile.create(newProfile);
        }
        else {

        }

    }).then(created=> {
        if (!created) {
            throw new Error("An error occurred while creating a user");
        }
        d.resolve(created)

    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
