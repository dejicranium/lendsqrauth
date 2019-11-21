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
const config = require('../../config');
const makeRequest = require('mlar')('makerequest');
const generateRandom = require('mlar')('testutils').generateRandom;

var spec = morx.spec({}) 
			   .build('id', 'required:true')   
			   .build('token', 'required:true') 
			   .build('action', 'required:true')  
               .end();

function service(data){

    const d = q.defer();
	
	
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		let params = validParameters.params;
		if (!['accept', 'decline'].includes(data.action)) {
			throw new Error("Action can only be `accept` or `decline`")
		}
		return models.user_invites.findOne({
            where: {
                id: params.id,
                token: params.token
            }
        })
        
	}) 
	.then(async (invite) => { 
		if (!invite) throw new Error("No such invitation exists");
		let status = data.action == 'accept' ? 'accepted' : 'declined';
        await invite.update(
			{
				status: status
			}
		);
		if (data.action == 'decline') {
			// delete profile and perhaps user that were created;
			await models.profile.destroy({where: {id: invite.profile_created_id}}, {force: true})
			
			if (invite.user_created_id) {
				await models.user.destroy({where : {id: invite.user_created_id}}, {force: true})
			}
		}
        d.resolve(`Invitation ${status}`);
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
