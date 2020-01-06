const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const paginate = require('mlar')('paginate');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;

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
					'parent_profile_id'
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
				}
			]

			// if admin is making the request (only the admin route can pass `user_id`
			if (data.user_id) {

				query.where.user_id = data.user_id

			} else { //else, where user_id is not passed, it means that the user is making the request 

				query.where.user_id = data.user.id;

			}

			return models.profile.findAndCountAll(query);

		})
		.then((profiles) => {
			if (!profiles) throw new Error("No profile found")
			d.resolve(paginate(profiles.rows, 'profiles', profiles.count, limit, page));
			//d.resolve(profiles)
		})
		.catch((err) => {

			d.reject(err);

		});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;