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
const AuditLog = require('mlar')('audit_log');

var spec = morx.spec({}) 
			   .build('token', 'required:true') 
               .end();

function service(data){

    const d = q.defer();
	
	
	q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
		let params = validParameters.params;
		
		
		return models.user_invites.findOne({
            where: {
                token: params.token
            }
        })
        
	}) 
	.then(async (invite) => { 
		if (!invite) throw new Error("No such invitation exists");
        await invite.update(
			{
				status: 'declined'
			}
		);
		// delete profile and perhaps user that was created;
		await models.profile.destroy({where: {id: invite.profile_created_id}}, {force: true})
		
		if (invite.user_created_id) {
			await models.user.destroy({where : {id: invite.user_created_id}}, {force: true})
		}

		// create audit_log
		let audit_log = new AuditLog(data.reqData, 'UPDATE', 'rejected invitation to become a team member');
		await audit_log.create();

        d.resolve(`Invitation declined`);
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
