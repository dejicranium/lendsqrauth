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

			}
			//data.distinct = true;
			data.include = [{
				model: models.profile,
				required: true,
				include: [{
					model: models.user,
					required: true,
					attributes: {
						exclude: DEFAULT_EXCLUDES
					}
				}, {
					model: models.role,
					attributes: {
						exclude: DEFAULT_EXCLUDES
					}
				}]


			}]
			/*
			data.attributes = {
				exclude: [
					'role_id'
				]
			}*/

			/*

			data.include = [{
					model: models.role,
					attributes: {
						exclude: DEFAULT_EXCLUDES
					}
				},

				{
					model: models.user,
					attributes: {
						exclude: DEFAULT_EXCLUDES
					}
				},
				
			]*/

			return models.user_invites.findAndCountAll(data);


		})
		.then((profiles) => {
			if (!profiles) throw new Error("No profile found")
			profiles.rows = profiles.rows;
			profiles.rows = profiles.rows.map(p => p.profile)
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