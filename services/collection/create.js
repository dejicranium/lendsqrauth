const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 
const config = require('../../config');
const makeRequest = require('mlar')('makerequest');
const crypto = require('crypto');
const requests = require('mlar')('requests');

var spec	=   morx.spec({}) 
				.build('borrower_first_name', 'required:true, eg:lender')   
				.build('borrower_last_name', 'required:true, eg:lender')   
				.build('borrower_email', 'required:true, eg:itisdeji@gmail.com')   
				.build('borrower_phone', 'required:true, eg:08100455706')   
				.build('borrower_bvn', 'required:true, eg:42341234552')   
				.end();

function service(data){

	var d = q.defer();
	const globalUserId = data.USER_ID || 1;
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;

		if (params.borrower_first_name.length < 3) throw new Error("Names must be more than 2 characters")
		if (params.borrower_last_name.length < 3) throw new Error("Names must be more than 2 characters")

		assert.digitsOnly(params.borrower_bvn, null, 'BVN')
		assert.digitsOnly(params.borrower_phone, null, 'Phone')
		assert.emailFormatOnly(params.borrower_email, null, 'Email')
		
		//all or none
		assert.mustBeAllOrNone(
			[
				params.borrower_first_name,
				params.borrower_last_name,
				params.borrower_phone,
				params.borrower_bvn,
				params.borrower_email,
				
			],
			[
				"borrower's first name",
				"last name",
				"phone",
				"bvn",
				"email",

			]
		)
		

		/*
		if (params.borrower_bvn) {
			// first verifiy that there is a bvn
			const requestHeaders = {
				'Content-Type' : 'application/json',
			}
            let  url = config.utility_base_url + "verify/bvn";
            let payload = {
                bvn: params.borrower_bvn
            }
			
			let verifiedBVN = await makeRequest(url, 'POST', payload, requestHeaders, 'Verify BVN');

            if (verifiedBVN && verifiedBVN.mobile) {
            }
            else {
                throw new Error("Could not verify BVN");
            }

		}*/

		
		let user_with_email_exists = false;

		if (params.borrower_email) {
			// find out whether person with the email already has a user account 
			let user_account = await models.user.findOne({
				where: {
					email: params.borrower_email
				},
				include: [
					{
						model: models.profile,
						
						include: [
							{
								model: models.role
							}
						]
					}
				]
			});
			
			// fetch borrower_role before hand 
			let borrower_role = await models.role.findOne({
				where: {
					name: 'borrower'
				}
			});

			let create_new_borrower_profile = function(user_id) {
				return models.profile.create({
					role_id: borrower_role.id,
					parent_profile_id: data.profile.id, // TODO: get real parent_profile_id
					user_id: user_id
				});
			} 

			if (user_account && user_account.email) {
				user_with_email_exists = true;

				if (user_account.profiles) {
					
					let user_has_borrower_profile = false;

					let profiles = user_account.profiles;
					
					profiles.forEach(profile=> {
						if (profile.role_id == borrower_role.id) {
							user_has_borrower_profile = true;
						}
					});

					// if user does not have a borrower profile, simply, create one for him

					if (!user_has_borrower_profile) {					
						return [
							create_new_borrower_profile(user_account.id),
							'NEW-PROFILE',
							params,
						]
					}

					else {  // when user already has a profile
						let user_borrower_profile = profiles.find(profile => profile.role_id == borrower_role.id);
						return [
							user_borrower_profile,
							'OLD-PROFILE',
							params,

						]
					}
				}
				else {
					return [
						create_new_borrower_profile(user_account.id),
						"new-profile",
						params
					]
				}
			}
			else {
				return[
					'none',
					'none',
					params,
				]
			}
		}
	})

	.spread ( async (borrower_profile, profile_created, params) => {
		if (params.borrower_first_name && params.borrower_last_name) {
			params.borrower_name = params.borrower_first_name + " " + params.borrower_last_name;
		}

		if ( borrower_profile && borrower_profile != 'none') {
			params.borrower_id = borrower_profile.id;
		}

		params.lender_id = data.profile.id; // set the lender profile to the person making this request

		return models.collection.create(params);
	})
	.then(async collection => {
		if (!collection) throw new Error("Could not create collection");
		// create new auth_token for this

		let invitation_meta = {
			collection_id: collection.id
		}
	
		let token =	crypto.randomBytes(32).toString('hex');

		await models.auth_token.create({type: 'borrower_invitation', token: token, meta: JSON.stringify(invitation_meta), is_used: 0})

		// set email
		/*
		let lender_identity = data.profile.business_name || data.user.first_name + ' ' + data.user.last_name
		
		let data =  {
			lender: lender_identity,
			accept_url : config.base_url + 'reject-borrower-invite',
			reject_url: config.base_url + 'accept-borrower-invite',
			borrower: data.borrower_first_name + ' ' + data.borrower_last_name,
		}
		
		await requests.inviteBorrower(data.borrower_email, lender_identity, accept_link, reject_link);
		*/
		d.resolve(collection)
	})
	.catch(err => {
		d.reject(err);
	})

	return d.promise;

}

		
		


















service.morxspc = spec;
module.exports = service;
