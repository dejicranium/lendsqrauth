const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const paginate = require('mlar')('paginate');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;

var spec = morx.spec({})
	//.build('user_id', 'required:true, eg:1')   
	.end();

function service(data) {

	var d = q.defer();

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

			data.where = {
				//parent_profile_id: data.profile.id, // profile of the user making the request
				status: 'accepted',
				inviter: data.profile.id

			};

			return models.user_invites.findAndCountAll(data);


		})
		.then((invites) => {
			if (!invites) throw new Error("No profile found")
			invites.rows = JSON.parse(JSON.stringify(invites.rows))
			let emails = invites.rows.map(p => p.invitee)


			let get_users = models.user.findAll({
				where: {
					email: {
						$in: emails
					}
				},

				attributes: {
					exclude: DEFAULT_EXCLUDES
				}
			})

			return get_users
		}).then(async users => {
			let users_id = users.map(u => u.id)
			let get_profiles = models.profile.findAll({
				where: {
					user_id: {
						$in: users_id
					}
				},
				attributes: {
					exclude: DEFAULT_EXCLUDES
				}
			})
			let profiles = await get_profiles;
			users = JSON.parse(JSON.stringify(users))
			users.forEach(u => {
				u.profile = profiles.find(profile => profile.user_id)
			});
			d.resolve(users)
		})

		.catch((err) => {

			d.reject(err);

		});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;