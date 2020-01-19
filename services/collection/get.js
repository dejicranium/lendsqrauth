const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const paginate = require('mlar')('paginate');

var spec = morx.spec({})

	.build('collection_id', 'required:false, eg:lender')

	.end();

function service(data) {

	const d = q.defer();
	const page = data.page ? Number(data.page) : 1;
	const limit = data.limit ? parseInt(data.limit) : 20;
	const offset = page ? (page - 1) * limit : false;

	data.limit = limit;
	data.offset = offset;

	q.fcall(async () => {
			const validParameters = morx.validate(data, spec, {
				throw_error: true
			});
			const params = validParameters.params;
			let getFunction = null;

			if (params.collection_id) {
				let query = {
					where: {}
				};
				query.where.id = params.collection_id;
				query.include = [{
					model: models.product
				}]
				getFunction = models.collection.findOne({
					where: {
						id: params.collection_id
					}
				})

			} else {
				let query = {
					limit: data.limit,
					offset: data.offset,
					where: {}
				}

				if (data.lender_id) query.where.lender_id = data.lender_id;
				if (data.product_id) query.where.product_id = data.product_id;
				if (data.loan_status) query.where.loan_status = data.loan_status;
				if (data.status) query.where.status = data.status;
				if (data.tenor) query.where.tenor = data.tenor;
				if (data.tenor_type) query.where.tenor_type = data.tenor_type;
				if (data.max_tenor) query.where.max_tenor = data.max_tenor;
				if (data.min_tenor) query.where.min_tenor = data.min_tenor;
				if (data.interest_period) query.where.interest_period = data.interest_period;
				if (data.interest) query.where.interest = data.interest;
				if (data.repayment_method) query.where.repayment_method = data.repayment_method;
				if (data.repayment_model) query.where.repayment_model = data.repayment_model;
				if (data.product_description) query.where.product_description = {
					$like: '%' + data.product_description + '%'
				};
				if (data.product_name) query.where.product_name = {
					$like: '%' + data.product_name + '%'
				};
				if (data.uuid) query.where.uuid = {
					$like: '%' + data.uuid + '%'
				};
				if (data.url_slug) query.where.url_slug = {
					$like: '%' + data.url_slug + '%'
				};
				if (data.min_loan_amount) query.min_loan_amount = data.min_loan_amount;
				if (data.max_loan_amount) query.max_loan_amount = data.max_loan_amount;
				if (data.borrower_id) query.where.borrower_id = data.borrower_id;
				if (data.borrower_first_name) query.where.borrower_first_name = data.borrower_first_name;
				if (data.borrower_last_name) query.where.borrower_last_name = data.borrower_last_name;
				if (data.lender_name) query.where.num_of_collections = data.num_of_collections;
				if (data.collection_frequency) query.where.collection_frequency = data.collection_frequency;

				if (['business_lender', 'individual_lender'].includes(data.profile.role)) {
					query.where.lender_id = data.profile.id
				} else if (data.profile.role == 'borrower') {
					query.where.lender_id = data.profile.parent_profile_id
					query.where.borrower_id = data.profile.id
				} else if (data.profile.role == 'collaborator') {
					query.where.lender_id = data.profile.parent_profile_id
				}

				query.include = [{
					model: models.product,
					attributes: ['product_name', 'interest', 'interest_period']
				}];
				query.order = [
					['id', 'DESC']
				];

				query.where.$or = [{
					deleted_flag: null
				}, {
					deleted_flag: false
				}]
				/*query.where.deleted_flag = {
					$ne: 1
				};*/
				getFunction = models.collection.findAndCountAll(query)
			}

			return [getFunction, params]

		})
		.spread(async (collections, params) => {
			if (!collections) throw new Error("No such product");
			// if one, check who is making the request
			if (params.collection_id) {
				let collection = collections

				let collection_creator = collection.lender_id
				let collection_borrower = collection.borrower_id

				if (['business_lender', 'individual_lender'].includes(data.profile.role) && collection_creator != data.profile.id) {
					throw new Error("Cannot get collection that your profile didn't create")
				} else if (data.profile.role == 'borrower' && collection_borrower != data.profile.id) {
					throw new Error("You aren't a borrower on this collection")
				} else if (data.profile.role == 'collaborator' && collection_creator !== data.profile.parent_profile_id) {
					throw new Error("You aren't a collaborator on the profile that created this collection")
				}

				if (collection.deleted_flag == 1) throw new Error('Collection has been deleted')
				d.resolve(collections)
			}

			collections.rows = JSON.parse(JSON.stringify(collections.rows));

			let lender_ids =
				collections.rows.map(c => c.lender_id)
			let lenders = [];
			if (lender_ids) {
				lenders = await models.profile.findAll({
					where: {
						id: {
							$in: lender_ids
						}
					},
					attributes: ['id'],
					include: [{
						model: models.user,
						attributes: ['uuid', 'first_name', 'last_name', 'email', 'business_name', 'phone']
					}]
				})
			}
			collections.rows.forEach(c => {
				if (lender_ids.includes(c.lender_id)) {
					c.lender = lenders.find(l => l.id == c.lender_id)

				}
			})


			d.resolve(paginate(collections.rows, 'collections', collections.count, limit, page))

		})
		.catch((err) => {

			d.reject(err);

		});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;