const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const bcrypt = require('bcrypt'); 
const validators = require('mlar')('validators'); 
const obval = require('mlar')('obval'); 
const assert = require('mlar')('assertions'); 
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const moment = require('moment')
const config = require('../../config');
const makeRequest = require('mlar')('makerequest');
const crypto = require('crypto');

var spec = morx.spec({}) 
			   .build('first_name', 'required:true, eg:1')   
			   .build('last_name', 'required:true, eg:1')   
			   .build('email', 'required:true, eg:1')   
			   .build('phone', 'required:true, eg:1')   
			   .end();

function service(data){

	var d = q.defer();
	const globalProfileId = data.profile.id;
    const globalUserId = data.user.id;
            
    const requestHeaders = {
        'Content-Type' : 'application/json',
    }
    
    q.fcall( async () => {
		var validParameters = morx.validate(data, spec, {throw_error:true});
        let params = validParameters.params;
        
        const requestHeaders = {
            'Content-Type' : 'application/json',
        }
        // check to make sure that only a lender can do this;
        
        if (data.profile.role !== 'individual_lender' && data.profile.role !== 'business_lender') {
            throw new Error("Only lenders can add team members")
        }
        
        
        // through the email, find out  whether user already exist
        return [
            models.user.findOne({where:{email: params.email }}), 
            params
        ]
		
	}) 
	.spread(async (user, params) => { 
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

            let paramsToCopy = {...userProfile}
            paramsToCopy.role_id = collaboratorRoleId;
            paramsToCopy.user_id = user.id
            paramsToCopy.parent_profile_id = globalProfileId;
            paramsToCopy.create_on = new Date();
            newProfile = paramsToCopy;



            let newProfileContact = {
                contact_first_name: params.first_name,
                contact_last_name: params.last_name,
                contact_email: params.email,
                contact_phone: params.phone,
                created_on: new Date(),
            }

            return models.sequelize.transaction((t1) => {
                return q.all([
                    models.profile.create(newProfile, {transaction: t1}), 
                    models.profile_contact.create(newProfileContact, {transaction: t1})
                ]);
            })
        }
        else {

            // create an incomplete user
            return [params, models.user.create({ created_by: globalUserId }),'user-created']
        }

    }).spread(async (params, created1, created2) => {
        if (!created1) {
            throw new Error("An error occurred while creating a user");
        }

        if ( created2 == 'user-created' ) {
            // update profile_contact 

            await created2.update({profile_id: created1.id});
        }

        // send email 
        let payload= {
            context_id: 69,
            sender: config.sender_email,
            recipient: params.email,
            sender_id: 1,
            data:{
                email: params.email,
                name: params.first_name + ' ' + params.last_name
	        }
        }

        const url = config.notif_base_url + "email/send";
        // send the welcome email 
        await makeRequest(url, 'POST', payload, requestHeaders);
        
        d.resolve("Invited team member")

    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
