const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const paginate = require('mlar')('paginate');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const roleUtils = require('../../utils/roles');

var spec = morx.spec({})
	.build('user_id', 'required:false, eg:1')
	.end();

function service(data) {

	var d = q.defer();
	let query = {
		where: {}
	}
	const page = data.page ? Number(data.page) : 1;
	const limit = data.limit ? Number(data.limit) : 20;
	const offset = page ? (page - 1) * limit : false;

	data.limit = limit;
	data.offset = offset;

	q.fcall(async () => {
			const validParameters = morx.validate(data, spec, {
				throw_error: true
			});
			const params = validParameters.params;

			query.attributes = {
				exclude: [
					'role_id',
					...DEFAULT_EXCLUDES,
				]
			}

			query.include = [{
					model: models.role,
					where: {
						name: {
							$ne: 'admin'
						}
					},
					attributes: {
						exclude: ['password', ...DEFAULT_EXCLUDES, 'business_name', 'active', 'deleted', 'disabled']

					},
					required: false,
				},
				{
					model: models.user,
					attributes: {
						exclude: ['password', ...DEFAULT_EXCLUDES, 'business_name', 'active', 'deleted', 'disabled']
					},
					required: false,

				},
				{
					model: models.business_info,
					attributes: {
						exclude: DEFAULT_EXCLUDES
					},
					required: false,
				}, {
					model: models.profile_contact,
					attributes: {
						exclude: DEFAULT_EXCLUDES
					},
					required: false,
				}, {
					model: models.borrower_invites,
					attributes: {
						exclude: DEFAULT_EXCLUDES
					},

					required: false
				},

			]

			// if admin is making the request (only the admin route can pass `user_id`
			if (data.user_id) {

				query.where.user_id = data.user_id

			} else { //else, where user_id is not passed, it means that the user is making the request 

				query.where.user_id = data.user.id;

			}

			query.where.$or = [{
				deleted_flag: null
			}, {
				deleted_flag: false
			}];

			return models.profile.findAndCountAll(query);

		})
		.then(async (profiles) => {
			if (!profiles) throw new Error("No profile found")
			profiles.rows = JSON.parse(JSON.stringify(profiles.rows));


			let finalresp = [];

			// see if any of the profiles is a collaborator 
			let collaborator_profiles = profiles.rows.filter(profile => profile.role.name == 'collaborator');
			let collaborator_profiles_ids = collaborator_profiles.map(profile => profile.id);
			let user_invites = await models.user_invites.findAll({
				where: {
					profile_created_id: collaborator_profiles_ids
				}
			});



			for (let i = 0; i < profiles.rows.length; i++) {
				let profile = profiles.rows[i];
				/*if (profile && profile.borrower_invite && profile.borrower_invite.status == 'Accepted') {
					finalresp.push(profile);
					continue
				}*/
				if (profile.role.name == 'collaborator') {
					let user_invite = user_invites.find(p => p.profile_created_id == profile.id);
					if (user_invite.status == 'accepted') {
						finalresp.push(profile)
						continue
					}
				}
				if (profile.role.name !== 'collaborator') {
					finalresp.push(profile)
				}
			}


			/*
			profiles.rows.forEach(profile => {
				if ((profile.role.name == "collaborator" || profile.role.name == "borrower")) {
					if (profile.parent_profile_id) {
						finalresp.push(profile);
					}
				} else {
					finalresp.push(profile);
				}
			})

			// for borrower profile  -- make sure that there's at least one borrower profile
			let borrower_profiles = profiles.rows.filter(profile => profile.role.name == 'borrower')

			if (borrower_profiles) {
				// get all borrower profiles id
				let borrower_profile_ids = borrower_profiles.map(profile => profile.id);

				let borrower_invites = await models.borrower_invites.findAll({
					where: {
						profile_created_id: borrower_profile_ids,
						status: 'accepted' // get only profiles of accepted invitations
					}
				})


			


			}

			*/
			d.resolve(paginate(finalresp, 'profiles', profiles.count, limit, page));
			//d.resolve(profiles)
		})
		.catch((err) => {

			d.reject(err);

		});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;