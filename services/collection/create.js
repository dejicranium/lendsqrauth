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
const AuditLog = require('mlar')('audit_log');
const sendCollectionCreatedEmail = require('../../utils/notifs/collection_created');
const validateBorrowerBvnUniqueness = require('../../utils/collections').validateBorrowerBvnUniqueness
const verifications = require('../../utils/verifications');

var spec = morx.spec({})
	.build('borrower_first_name', 'required:true, eg:lender')
	.build('borrower_last_name', 'required:true, eg:lender')
	.build('borrower_email', 'required:true, eg:itisdeji@gmail.com')
	.build('borrower_phone', 'required:true, eg:08100455706')
	.build('borrower_bvn', 'required:true, eg:42341234552')
	.end();





function service(data) {

	var d = q.defer();
	const globalUserId = data.USER_ID || 1;
	let invitation_data = {};

	q.fcall(async () => {
			const validParameters = morx.validate(data, spec, {
				throw_error: true
			});
			const params = validParameters.params;
			params.created_on = new Date();

			if (params.borrower_first_name.length < 3) throw new Error("Names must be more than 2 characters")
			if (params.borrower_last_name.length < 3) throw new Error("Names must be more than 2 characters")

			let requestUser = await models.user.findOne({
				where: {
					id: data.user.id
				}
			})

			if (requestUser.email === params.borrower_email) throw new Error("You can't add yourself as a borrower");

			assert.digitsOnly(params.borrower_bvn, null, 'BVN');
			assert.digitsOnly(params.borrower_phone, null, 'Phone');
			assert.emailFormatOnly(params.borrower_email, null, 'Email');

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
			);


			await validateBorrowerBvnUniqueness(params.borrower_email, params.borrower_bvn);
			await verifications.verifyBVN(params.borrower_bvn);
			await verifications.verifyPhone(params.borrower_phone);



			let user_with_email_exists = false;

			if (params.borrower_email) {

				// find out whether person with the email already has a user account 
				let user_account = await models.user.findOne({
					where: {
						email: params.borrower_email
					},
					include: [{
						model: models.profile,

						include: [{
							model: models.role
						}]
					}]
				});

				// fetch borrower_role before hand 
				let borrower_role = await models.role.findOne({
					where: {
						name: 'borrower'
					}
				});

				// inner function for creating a new borrower profile
				let create_new_borrower_profile = function (user_id) {
					return models.profile.create({
						role_id: borrower_role.id,
						parent_profile_id: data.profile.id,
						user_id: user_id,
						created_on: new Date(),
						status: 'active',
						uuid: Math.random().toString(36).substr(2, 9),
					});
				};

				let create_new_user = function () {
					return models.user.create({
						first_name: params.borrower_first_name,
						last_name: params.borrower_last_name,
						phone: params.borrower_phone,
						email: params.borrower_email,
						status: 'active'
					})
				};

				if (user_account && user_account.email) {
					user_with_email_exists = true;

					if (user_account.profiles) {

						let user_has_borrower_profile = false;
						let profiles = user_account.profiles;

						profiles.forEach(profile => {
							if (parseInt(profile.role_id) === parseInt(borrower_role.id)) {
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
						} else { // when user already has a profile
							let user_borrower_profile = profiles.find(profile => profile.role_id === borrower_role.id);
							return [
								user_borrower_profile,
								'OLD-PROFILE',
								params,

							]
						}
					} else {
						return [
							create_new_borrower_profile(user_account.id),
							"NEW-PROFILE",
							params
						]
					}
				} else {
					let new_user = await create_new_user(); // create a new user

					// create wallet;
					let createWallet = require('../../utils/wallet').create;
					await createWallet(new_user);

					return [
						create_new_borrower_profile(new_user.id),
						'NEW-PROFILE',
						params,
					]
				}
			}
		})

		.spread(async (borrower_cred, profile_created, params) => {
			if (borrower_cred && borrower_cred.id) { // if there's borrower_cred.first_name, it means a new user was created instead of a new borrower
				params.borrower_id = borrower_cred.id;
			}

			params.lender_id = data.profile.id; // set the lender profile to the person making this request
			params.status = "draft";


			invitation_data = {
				inviter_id: data.profile.id,
				date_invited: new Date(),
				borrower_name: data.borrower_first_name + " " + data.borrower_last_name,
			};

			if (borrower_cred && borrower_cred.id) { // if there's borrower_cred.first_name, it means a new user was created instead of a new borrower
				invitation_data.profile_created_id = borrower_cred.id
			}

			return models.collection.create(params);
		})
		.then(async collection => {
			if (!collection) throw new Error("Could not create collection");


			// create new auth_token for this
			invitation_data.collection_id = collection.id;
			invitation_data.token = crypto.randomBytes(32).toString('hex');

			// create borrower invites
			await models.borrower_invites.create(invitation_data);

			let audit = new AuditLog(data.reqData, "CREATE", "created a new collection. Collection ID " + collection.id);
			await audit.create();

			d.resolve(collection)
		})
		.catch(err => {
			d.reject(err);
		});

	return d.promise;

}





















service.morxspc = spec;
module.exports = service;