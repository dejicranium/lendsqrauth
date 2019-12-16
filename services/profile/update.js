const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');

var spec = morx.spec({})
	.build('role_id', 'required:false, eg:lender')
	.build('profile_id', 'required:false, eg:lender')
	.build('url', 'required:false, eg:lender')
	.build('bvn', 'required:false, eg:lender')
	.build('business_logo', 'required:false, eg:lender')
	.build('business_name', 'required:false, eg:lender')
	.build('business_phone', 'required:false, eg:lender')
	.build('rc_number', 'required:false, eg:lender')
	.build('certificate_of_incorporation', 'required:false, eg:lender')
	.build('tin_number', 'required:false, eg:lender')
	.build('state', 'required:false, eg:lender')
	.build('country', 'required:false, eg:lender')
	.build('contact_first_name', 'required:false, eg:lender')
	.build('contact_last_name', 'required:false, eg:lender')
	.build('contact_phone', 'required:false, eg:lender')
	.build('contact_email', 'required:false, eg:lender')
	.build('support_email', 'required:false, eg:lender')
	.build('social_links', 'required:false, eg:lender')
	.build('status', 'required:false, eg:lender')

	.end();

function service(data) {

	var d = q.defer();

	q.fcall(async () => {
			const validParameters = morx.validate(data, spec, {
				throw_error: true
			});
			const params = validParameters.params;
			if (params.role_id) throw new Error("Cannot update role");
			if (params.status) {
				if (!['active', 'inactive'].includes(params.status))
					throw new Error("Status can be only active or inactive");

				// make sure that it is only the parent of the user that can do this stuff;
			}
			return [
				models.profile.findOne({
					where: {
						id: params.profile_id
					}
				}),
				params
			];


		})
		.spread(async (profile, params) => {
			if (!profile) throw new Error("Profile does not exist");

			if (params.status) {
				// make sure that only the parent of the profile can update the profile
				if (profile.parent_profile_id != data.profile.id && data.profile.role !== 'admin') {
					throw new Error("Only a parent profile or admin can update a user's status");

				}
			}

			// if the person updating is the parent of the profile,
			// make sure that the only thing they can update is the status
			if (profile.id !== data.profile.id && data.profile.role !== 'admin' && profile.parent_profile_id == data.profile.id) {
				if (!params.status) throw new Error("You can only update a team member's status");
				else {
					// invalidate other fields that he is trying to update by changing the content of params
					params = {
						status: params.status
					}
				}
			}
			if (profile.user_id !== data.user.id && profile.id !== data.profile.id && data.profile.role !== 'admin' && profile.parent_profile_id !== data.profile.id) {
				throw new Error("You cannot update a profile that isn't yours")
			} else if (profile.user_id == data.user.id && profile.id !== data.profile.id && data.profile.role !== 'admin' && profile.parent_profile_id !== data.profile.id) {
				throw new Error("You can't update another profile of yours unless you're logged in with it")
			}



			/*
			if ((profile.user_id != data.user.id) && data.profile.role != 'admin')
				throw new Error("Only admins can update someone else's profile");*/

			if (params.rc_number) {
				// check for rc_number - which must be unique;
				let profile_with_rc_number = await models.business_info.findOne({
					where: {
						rc_number: params.rc_number
					}
				})
				if ((profile_with_rc_number && profile_with_rc_number.id) && profile_with_rc_number.profile_id !== data.profile.id) {
					throw new Error("Profile with RC Number already exists");
				}
			}

			//params = params.map(p. => p != "");

			return [
				profile.update({
					...params
				}),
				params
			];

		}).spread(async (profile, params) => {
			if (!profile) throw new Error("An error occured while updating user's profile");

			// update contact too
			let profile_contact =
				await models.profile_contact.findOne({
					where: {
						profile_id: profile.id
					}
				})
			params.profile_id = profile.id
			if (params.social_links) {
				// get social links from profile_contact 
				//let existing_social_links = JSON.parse(JSON.stringify(profile_contact.social_links));

				// when nothing exists;
				let fields = Object.keys(params.social_links);

				let social_contact_array = [];
				for (let i = 0; i < fields.length; i++) {
					let field = fields[i];
					let new_object = {};

					new_object[field] = params.social_links[field];
					social_contact_array.push(new_object);
				}

				params.social_links = JSON.stringify(social_contact_array)


			} else {
				delete params.social_links
			}



			if (profile_contact && profile_contact.id) {
				await profile_contact.update(params);

			} else {
				await models.profile_contact.create(params)
			}

			if (data.profile.role == 'business_lender') {
				params.profile_id = profile.id
				await models.business_info.findOrCreate({
						where: {
							profile_id: profile.id
						},
						defaults: params
					})
					.spread(async (info, created) => {
						if (!created) await info.update({
							...params
						})
					})
			}


			d.resolve("Successfully updated user's profile");
		})
		.catch((err) => {

			d.reject(err);

		});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;