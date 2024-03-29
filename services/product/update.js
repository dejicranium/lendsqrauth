const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const AuditLog = require('mlar')('audit_log');
const product_utils = require('mlar')('product_utils');
const resolvers = require('mlar')('resolvers');


var spec = morx.spec({})
	.build('product_id', 'required:true, eg:1')
	.build('product_name', 'required:false, eg:lender')
	.build('product_description', 'required:false, eg:1')
	.build('repayment_model', 'required:false, eg:lender')
	.build('repayment_method', 'required:false, eg:lender')
	.build('min_loan_amount', 'required:false, eg:lender')
	.build('max_loan_amount', 'required:false, eg:lender')
	.build('tenor_type', 'required:false, eg:lender')
	.build('min_tenor', 'required:false, eg:lender')
	.build('max_tenor', 'required:false, eg:lender')
	.build('interest_period', 'required:false, eg:lender')
	.build('interest', 'required:false, eg:lender')
	.build('urL_slug', 'required:false, eg:lender')
	.build('status', 'required:false, eg:lender')
	.end();

function service(data) {

	var d = q.defer();
	const globalUserId = data.USER_ID || 1;

	q.fcall(async () => {
			const validParameters = morx.validate(data, spec, {
				throw_error: true
			});
			const params = validParameters.params;


			// min tenor and max tenor amount must exist together,
			assert.mustBeAllOrNone([params.min_tenor, params.max_tenor], ['Min Tenor', 'Max Tenor'])

			if (params.max_tenor) assert.digitsOnly(params.max_tenor, null, 'max tenor')
			if (params.min_tenor) assert.digitsOnly(params.min_tenor, null, 'min tenor')

			if (params.max_tenor && params.min_tenor) {
				if (parseInt(params.min_tenor) > parseInt(params.max_tenor)) {
					throw new Error("Min tenor cannot be greater than max tenor")
				}
			}


			// interest must be a digit or a float
			if (params.interest) {
				assert.digitsOrDecimalOnly(params.interest, null, 'interest')
			}

			// max loan amount and min_loan amount must exist together,
			assert.mustBeAllOrNone([params.min_loan_amount, params.max_loan_amount], ['Min Loan Amount', 'Max Loan Amount'])

			// must be digits or float
			if (params.min_loan_amount) {
				assert.digitsOrDecimalOnly(params.min_loan_amount)
				params.min_loan_amount = parseFloat(params.min_loan_amount).toFixed(2);

			}
			// digits or float
			if (params.max_loan_amount) {
				assert.digitsOrDecimalOnly(params.max_loan_amount)
				params.max_loan_amount = parseFloat(params.max_loan_amount).toFixed(2);
			}

			if (params.min_loan_amount && params.max_loan_amount) {
				// min loan amount cannot be greater than max loan amount.
				if (parseFloat(params.min_loan_amount) > parseFloat(params.max_loan_amount))
					throw new Error("Min loan amount cannot be greater than max loan amount");
			}


			if (params.repayment_method) {
				params.repayment_method = params.repayment_method.toLowerCase();
				if (!['card', 'direct debit', 'bank transfer', 'cheque', 'cash'].includes(params.repayment_method)) {
					throw new Error("Repayment method can only be card, direct debit, bank transfer, cheque or cash")

				}
			}
			if (params.repayment_model) {
				params.repayment_model = params.repayment_model.toLowerCase();
				if (!['equal installments', 'reducing balance'].includes(params.repayment_model)) {
					throw new Error('Repayment model can be either `equal installments` or `reducing balance`')

				}
			}
			if (params.tenor_type) {
				params.tenor_type = params.tenor_type.toLowerCase();
				if (!['days', 'weeks', 'months', 'years'].includes(params.tenor_type))
					throw new Error('Tenor type should be one of `days`, `weeks`, `months`, `years`')

			}
			if (params.interest_period) {
				params.interest_period = params.interest_period.toLowerCase();

				if (!['per day', 'per week', 'per month', 'per annum', 'flat'].includes(params.interest_period))
					throw new Error('Interest period should be one of `flat` `per day`, `per week`, `per month` or `per annum`')

			}

			if (params.product_name) {
				if (params.product_name.length > 255) throw new Error("Product name cannot be more than 255 characters");
			}

			let getProduct = models.product.findOne({
				where: {
					id: params.product_id,
				}
			})

			return [getProduct, params]

		})
		.spread(async (product, params) => {
			if (!product) throw new Error("No such product exists");
			if (product.profile_id != data.profile.id) throw new Error("Can't update someone else's product");


			if (params.product_name && product.product_name && (params.product_name != product.product_name)) {
				let similar = await models.product.findAll({
					where: {
						product_name: params.product_name
					},
					include: [{
						model: models.profile,
						required: false
					}]
				})
				// if user is updating the name 

				if (similar && similar.length) {
					let similar_owned_by_profile = similar.find(i => i.profile.id == data.profile.id);
					if (similar_owned_by_profile) throw new Error("You already have a product named " + params.product_name)
				}


			}
			// set creation details
			//params.profile_id = data.profile.id
			params.modified_on = new Date();
			params.modified_by = globalUserId;

			let p = product;


			return product.update(params)

		}).then(async (product) => {
			if (!product) throw new Error("An error occured while creating product");
			let p = product;

			d.resolve(p)
			let params = {};


			// see whether collection is in draft;
			let new_status1 = product.status == 'active' ? 'inactive' : 'draft';
			let new_status2 = product.status == 'active' ? 'active' : 'inactive';
			const required_fields = [
				'max_tenor',
				'min_tenor',
				'product_name',
				'product_description',
				'repayment_method',
				'min_loan_amount',
				'max_loan_amount',
				'tenor_type',
				'interest_period',
				'repayment_model',
				'interest'
			]
			params.status = resolvers.resolveCompletionStatus(
				product,
				required_fields,
				new_status1,
				new_status2
			);

			/*if (p.max_tenor == null || p.product_name == null || p.product_description == null || p.repayment_method == null ||
				p.repayment_model == null || p.min_loan_amount == null || p.max_loan_amount == null || p.tenor_type == null ||
				p.min_tenor == null || p.interest_period == null || p.interest == null) {
				params.status = 'draft';
			} else {
				if (params.status != 'active') {
					params.status = 'inactive';
				}
			}*/

			await product.update(params);

			// see whether loan is draft or not
			//let loan_is_draft = true;
			let audit = new AuditLog(data.reqData, "UPDATE", "updated product " + product.id);
			await audit.create();

			d.resolve(product);
		})
		.catch((err) => {

			d.reject(err);

		});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;