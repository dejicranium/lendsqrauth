const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const paginate = require('mlar')('paginate');

/**
 * This endpoint gets a list of borrowers
 * But the kindof borrowers that are returned depends on the parameters passed
 * where `profile_id` is passed, it means we are trying to get all the borrowers attached 
 * to a `profile_id`
 */
var spec = morx.spec({})
	.build('profile_id', 'required:false, eg:1')
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

			// get the borrower role.

			let borrowerRole = await models.role.findOne({
				where: {
					name: 'borrower'
				}
			});
			let borrowerRoleId = borrowerRole.id;


			// if we are getting the borrowers linked to a lender (using profile_id)
			if (params.profile_id) {

				data.where = {
					role_id: borrowerRoleId,
					parent_profile_id: params.profile_id,
				}
				data.include = [{
					model: models.user,
					attributes: {
						exclude: ['password']
					},

				}];

			} else {
				data.where = {
					role_id: borrowerRoleId
				}
				data.include = [{
					model: models.user,
					attributes: {
						exclude: ['password']
					}
				}, {
					model: models.borrower_invites,
					attributes: ['date_joined', 'borrower_name', 'collection_id'],

					include: [{
						model: models.collection,
						attributes: ['borrower_email']
					}]
				}];


				// if a lender is making the request, get only his borrowers
				if (['individual_lender', 'business_lender'].includes(data.profile.role)) {
					data.where.parent_profile_id = data.profile.id
				}
			}
			data.order = [
				['id', 'DESC']
			]


			return models.profile.findAndCountAll(data);


		})
		.then((profile) => {
			if (!profile) throw new Error("No profiles");
			profile.rows = JSON.parse(JSON.stringify(profile.rows));
			let final_response = [];

			profile.rows.forEach(prof => {
				let profile_local = {};
				if (!prof.user) {
					prof.user = {}
				}

				if (prof.user.first_name || !prof.user.last_name) {

					let denormalized_borrower_name = prof.borrower_invite.borrower_name ? prof.borrower_invite.borrower_name.split(' ') : [];

					if (denormalized_borrower_name.length) {
						profile_local.first_name = denormalized_borrower_name[0];
						profile_local.last_name = denormalized_borrower_name.filter(name => denormalized_borrower_name.indexOf(name) !== 0).join(' ');

					}
					prof.user.first_name = profile_local.first_name;
					prof.user.last_name = profile_local.last_name;


					if (!prof.user.email) {
						prof.user.email = prof.borrower_invite.collection ? prof.borrower_invite.collection.borrower_email : ''
					}

				}


				final_response.push(prof);
			})

			d.resolve(paginate(profile.rows, 'profiles', profile.count, limit, page));
		})
		.catch((err) => {

			d.reject(err);

		});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;