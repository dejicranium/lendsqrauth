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
				//status: 'accepted',
				inviter: data.profile.id
			};


			data.include = [{
				model: models.profile,
				where: {},
				include: [{
						model: models.role,
						exclude: DEFAULT_EXCLUDES
					},
					{
						model: models.user,
						attributes: {
							exclude: DEFAULT_EXCLUDES
						},
						where: {}
					}
				]
			}]

			if (data.first_name) {
				data.include[0].include[1].required = true;

				data.include[0].include[1].where.first_name = {
					$like: '%' + data.first_name + '%'
				};

			}
			if (data.last_name) {
				data.include[0].include[1].required = true;

				data.include[0].include[1].where.last_name = {
					$like: '%' + data.last_name + '%'
				};

			}

			if (data.status) {
				data.status = data.status.toLowerCase();
				data.where.status = data.status;
			}

			if (data.email) {
				data.include[0].include[1].required = true;

				data.include[0].include[1].where.email = {
					$like: '%' + data.email + '%'
				}
			}
			delete data.first_name;
			delete data.last_name;
			delete data.email;
			delete data.status;

			// if we are searching by term
			if (data.search) {
				delete data.where;
				data.include[0].include[1].required = true;
				data.include[0].required = true;
				data.include[0].where.parent_profile_id = data.profile.id;

				// search first name, last name ,email , business name and phone;
				data.include[0].include[1].where.$or = [{
						first_name: {
							$like: '%' + data.search + '%'
						}
					},
					{
						last_name: {
							$like: '%' + data.search + '%'
						}
					},
					{
						business_name: {
							$like: '%' + data.search + '%'
						}
					},
					{
						phone: {
							$like: '%' + data.search + '%'
						}
					},
				];
			}
			data.order = [
				['id', 'DESC']
			];
			// if (data.sort)
			if (data.sort) {
				data.order = [
					[
						data.sort,
						'DESC'
					]
				]
			}
			return models.user_invites.findAndCountAll(data);
		})
		.then((invites) => {
			if (!invites) throw new Error("No profile found")

			invites.rows = JSON.parse(JSON.stringify(invites.rows));
			let final_invites = [];


			invites.rows.map(row => {
				let object = {};
				object = row.profile;
				final_invites.push(object);

			});

			d.resolve(paginate(final_invites, 'profiles', invites.count, limit, page))
		})

		.catch((err) => {

			d.reject(err);

		});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;