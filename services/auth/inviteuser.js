const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const bcrypt = require('bcrypt');
const validators = require('mlar')('validators');
const obval = require('mlar')('obval');
const assert = require('mlar')('assertions');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const moment = require('moment');
const config = require('../../config');
const makeRequest = require('mlar')('makerequest');
const crypto = require('crypto');
const requests = require('mlar')('requests');
const AuditLog = require('mlar')('audit_log');
const send_email = require('mlar').mreq('notifs', 'send');

var spec = morx.spec({}).build('email', 'required:true, eg:1').build('role_id', 'required:true, eg:1').end();

function service(data) {
	var d = q.defer();

	const globalProfileId = data.profile.id;
	const globalUserId = data.user.id;

	const requestHeaders = {
		'Content-Type': 'application/json'
	};

	let GLOBAL_USER_EXISTS = false;
	let GLOBAL_USER = null;
	q
		.fcall(async () => {
			var validParameters = morx.validate(data, spec, {
				throw_error: true
			});
			let params = validParameters.params;

			assert.emailFormatOnly(params.email);

			if (data.user.email == params.email) throw new Error('Cannot send an invitation to yourself');

			const requestHeaders = {
				'Content-Type': 'application/json'
			};

			// check to make sure that only a lender can do this;
			if (data.profile.role != 'individual_lender' && data.profile.role != 'business_lender') {
				throw new Error('Only lenders can add team members');
			}
			let role = await models.role.findOne({
				where: {
					id: parseInt(params.role_id)
				}
			});
			if (
				role &&
				role.id && ['individual_lender', 'admin', 'borrower', 'business_lender'].includes(role.name)
			) {
				throw new Error('Cannot add ' + role.name + ' as a team member');
			}

			// through the email, find out  whether user already exists
			return [
				models.user_invites.findOne({
					where: {
						inviter: data.profile.id,
						invitee: params.email
					}
				}),
				models.user.findOne({
					where: {
						email: params.email
					}
				}),
				params
			];
		})
		.spread(async (invitation, user, params) => {
			if (invitation && invitation.status !== 'declined') {
				throw new Error('Invitation has been sent already');
			}

			if (user) {

				GLOBAL_USER_EXISTS = true;
				GLOBAL_USER = user;

				// prepare to copy the details of the user's profile into a new and change only the role_id  (should be collaborator) and parent_profile_id
				let userProfile = await models.profile.findOne({
					where: {
						user_id: user.id
					}
				});
				params.uuid = Math.random().toString(36).substr(2, 9);
				params.created_on = new Date();
				params.parent_profile_id = data.profile.id;
				params.user_id = user.id;


				return [params, models.profile.create(params), 'none'];
			} else {
				// create an incomplete user
				let uuid = Math.random().toString(36).substr(2, 9);

				return [
					params,
					models.user.create({
						email: params.email,
						uuid: uuid,
						created_by: globalUserId
					}),
					'user-created'
				];
			}
		})
		.spread(async (params, created1, created2) => {
			if (!created1) {
				throw new Error('An error occurred while creating a user');
			}

			let new_profile_id = created1.id; // created1 is profile.id if no new user was created;



			if (created2 == 'user-created') {

				// if a new user was created.
				// create profile
				let new_profile = await models.profile.create({
					role_id: params.role_id,
					user_id: created1.id,
					parent_profile_id: globalProfileId,
					uuid: Math.random().toString(36).substr(2, 9)
				});
				new_profile_id = new_profile.id;

			}

			// invitation token
			let invite_token = await crypto.randomBytes(32).toString('hex');


			// create a user invite record
			let invitation = await models.user_invites.findOrCreate({
				where: {
					invitee: params.email,
					inviter: data.profile.id
				},
				defaults: {
					invitee: params.email,
					inviter: data.profile.id,
					token: invite_token,
					profile_created_id: new_profile_id, // we need to track the profile that was created as a result of this process
					user_created_id: created2 == 'user-created' ? created1.id : null
				}
			});


			if (!invitation[1]) {
				invitation[0].update({
					status: 'pending'
				});
			}

			// send email
			let payload = {
				context_id: 87,
				sender: config.sender_email,
				recipient: params.email,
				sender_id: 1,
				data: {
					token: invite_token
				}
			};
			const url = config.notif_base_url + 'email/send';

			try {
				await makeRequest(url, 'POST', payload, requestHeaders);
			} catch (e) {
				// silent treatment. To be logged;
			}

			// audit log
			if (GLOBAL_USER_EXISTS) audit_description = " with user id " + GLOBAL_USER.id
			let audit_log = new AuditLog(data.reqData, "CREATE", 'sent invitation to a potential team member')
			await audit_log.create();
			d.resolve('Invited team member');
		})
		.catch((err) => {
			console.log(err.stack);
			d.reject(err);
		});

	return d.promise;
}
service.morxspc = spec;
module.exports = service;