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
			if (invitation && invitation.status !== 'declined' && !invitation.deleted_flag) {
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
				params.status = 'pending'
				params.deleted_flag = null;



				return [params, models.profile.create(params), 'none'];
			} else {
				// create an incomplete user
				let uuid = Math.random().toString(36).substr(2, 9);

				return [
					params,
					models.user.create({
						email: params.email,
						uuid: uuid,
						created_by: globalUserId,
						status: 'active'
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
					status: 'pending',
					uuid: Math.random().toString(36).substr(2, 9),
					created_on: new Date()
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
					user_created_id: created2 == 'user-created' ? created1.id : GLOBAL_USER.id
				}
			});


			if (!invitation[1]) {
				await invitation[0].update({
					status: 'pending',
					profile_created_id: new_profile_id, // replace the former instance with the new profile created,
					user_created_id: created2 == 'user-created' ? created1.id : GLOBAL_USER.id
				});
			}

			// send email
			/*
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
			*/




			// send email 
			const emailPayload = {
				//userName: GLOBAL_USER ? GLOBAL_USER.first_name + ' ' + GLOBAL_USER.last_name || GLOBAL_USER.business_name || '' : created1.first_name + ' ' + created1.last_name || created1.business_name || '', // existing team member
				lenderFullName: data.user.first_name ? data.user.first_name + ' ' + data.user.last_name : data.user.business_name,
				lenderName: data.user.first_name ? data.user.first_name + ' ' + data.user.last_name : data.user.business_name,
				memberAcceptURL: "",
				memberDeclineURL: config.base_url + 'team/reject?token=' + invite_token
			}

			let INVITATION_EMAIL_CONTEXT_ID = 93;
			let recipient = null;

			if (GLOBAL_USER) {
				recipient = GLOBAL_USER.email
				emailPayload.userName = GLOBAL_USER.first_name ? GLOBAL_USER.first_name + ' ' + GLOBAL_USER.last_name : '';
				emailPayload.memberAcceptURL = config.base_url + 'team/accept?token=' + invite_token


				// if user had already been invited by some, he won't have a name or firstname
				if (!emailPayload.userName) {
					INVITATION_EMAIL_CONTEXT_ID = 94;
					emailPayload.memberAcceptURL = config.base_url + 'signup/team?token=' + invite_token

				}


			} else {
				INVITATION_EMAIL_CONTEXT_ID = 94;
				recipient = created1.email;
				emailPayload.userName = created1.first_name ? created1.first_name + ' ' + created1.last_name : '';
				emailPayload.memberAcceptURL = config.base_url + 'signup/team?token=' + invite_token

			}

			try {
				send_email(INVITATION_EMAIL_CONTEXT_ID, recipient, emailPayload);
			} catch (e) {
				// silent treatement
			}

			// audit log
			let audit_description = "sent invitation to a potential team member";

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