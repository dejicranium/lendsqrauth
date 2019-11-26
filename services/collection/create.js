const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 
const config = require('../../config');
const makeRequest = require('mlar')('makerequest');


var spec	=   morx.spec({}) 
				.build('borrower_first_name', 'required:false, eg:lender')   
				.build('borrower_last_name', 'required:false, eg:lender')   
				.build('borrower_email', 'required:false, eg:itisdeji@gmail.com')   
				.build('borrower_phone', 'required:false, eg:08100455706')   
				.build('borrower_bvn', 'required:false, eg:42341234552')   
				.build('product_id', 'required:false, eg:lender')   
				.build('tenor', 'required:false, eg:1')   
				.build('product_id', 'required:false, eg:1')   
				.build('disbursement_mode', 'required:false, eg:1000000')   
				.build('loan_status', 'required:false, eg:lender')   
				.build('disbursement_date', 'required:false, eg:lender')   
				.build('num_of_collections', 'required:false, eg:lender')   
				.build('repayment_id', 'required:false, eg:1')   
				.build('start_date', 'required:false, eg:lender')   
							
				.end();

function service(data){

	var d = q.defer();
	const globalUserId = data.USER_ID || 1;
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;


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

		}

		
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
					parent_profile_id: 1, // TODO: get real parent_profile_id
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

					else {
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
				let account = null;
				if (!user_with_email_exists) {
					account = await models.user.create({
						email: params.borrower_email,
						created_on: new Date()
					})
				}
				else {
					
					account = await models.user.findOne({
						email: params.borrower_email,
					})

				}


				return [
					// create a new account 					
					create_new_borrower_profile(account.id),
					"new-profile",
					params
				]

			}

		}
	})

	.spread ( async (borrower_profile, profile_created, params) => {
		if (params.borrower_first_name && params.borrower_last_name) {
			params.borrower_name = params.borrower_first_name + " " + params.borrower_last_name;
		}

		if ( borrower_profile && borrower_profile != 'null') {
			params.borrower_id = borrower_profile.id;
		}

		return models.collection.create(params);
	})
	.then(collection => {
		if (!collection) throw new Error("Could not create collection");

		d.resolve(collection)
	})
	.catch(err => {
		d.reject(err);
	})

	return d.promise;

}

		
		


















service.morxspc = spec;
module.exports = service;
