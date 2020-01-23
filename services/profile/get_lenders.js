const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const paginate = require('mlar')('paginate');

/**
 * This endpoint gets a list of lenders
 * But the kindof lenders that are returned depends on the parameters passed
 * 
 */
var spec = morx.spec({}).build('type', 'required:false, eg:1').build('profile_type', 'required:false, eg:1').end();

function service(data) {
	var d = q.defer();
	const page = data.page ? Number(data.page) : 1;
	const limit = data.limit ? Number(data.limit) : 20;
	const offset = page ? (page - 1) * limit : false;

	data.limit = limit;
	data.offset = offset;

	q
		.fcall(async () => {
			const validParameters = morx.validate(data, spec, {
				throw_error: true
			});
			const params = validParameters.params;

			data.where = {};
			// get the lender  role.
			if (params.type) {
				let profile_role = await models.role.findOne({
					where: {
						name: params.type
					}
				});

				data.where.role_id = profile_role.id;
				data.include = [{
					model: models.user,
					attributes: {
						exclude: ['password']
					}
				}];
			} else if (params.profile_type) {
				// when you append profile type to the query string
				data.include = [{
						model: models.user,
						attributes: {
							exclude: ['password']
						}
					},
					{
						model: models.role,
						where: {
							id: params.profile_type
						}
					}
				];

			} else {
				// get all lenders
				let lender_roles = await models.role.findAll({
					where: {
						name: {
							$in: ['individual_lender', 'business_lender']
						}
					}
				});
				lender_role_ids = lender_roles.map((role) => role.id);

				data.where.role_id = {
					$in: lender_role_ids
				};

				data.include = [{
						model: models.user,
						attributes: {
							exclude: ['password']
						}
					},
					{
						model: models.role,
						attributes: ['name']
					}
				];
			}

			if (data.search) {
				data.include[0].where = {
					$or: [{
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
							first_name: {
								$like: '%' + data.search + '%'
							}
						},
						{
							uuid: {
								$like: '%' + data.search + '%'
							}
						}
					]
				};
				delete data.search;
				if (data.first_name) delete data.first_name;
				if (data.last_name) delete data.last_name;
				if (data.business_name) delete data.business_name;
				if (data.uuid) delete data.uuid;

			}
			if (data.first_name) {
				data.where.first_name = {
					$like: '%' + data.first_name + '%'
				};
				delete data.first_name;
			}
			if (data.last_name) {
				data.where.last_name = {
					$like: '%' + data.last_name + '%'
				};
				delete data.last_name;
			}
			if (data.uuid) {
				data.where.uuid = {
					$like: '%' + data.uuid + '%'
				};
				delete data.uuid;
			}
			if (data.from) {
				data.where.created_on = {
					$gte: moment(date.from)
				};
				delete data.from;
			}
			if (data.to) {
				data.where.created_on = {
					$lte: moment(date.from).add(1, 'day')
				};
				delete data.to;
			}

			return models.profile.findAndCountAll(data);
		})
		.then((profile) => {
			if (!profile) throw new Error('No profiles');
			d.resolve(paginate(profile.rows, 'profiles', profile.count, limit, page));
		})
		.catch((err) => {
			//console.log(err.stack);
			d.reject(err);
		});

	return d.promise;
}
service.morxspc = spec;
module.exports = service;