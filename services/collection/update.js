const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const assert = require('mlar')('assertions');
const requests = require('mlar')('requests');
const makeRequest = require('mlar')('makerequest');
const config = require('../../config');
const resolvers = require('mlar')('resolvers');
const AuditLog = require('mlar')('audit_log');
const moment = require('moment');
const send_email = require('mlar').mreq('notifs', 'send');
const detect_change = require('mlar')('detectchange');
const validateCollectionSetup = require('../../utils/collections').validateSetup;
const validateDateThresholds = require('../../utils/collections').validateDateThresholds;
const initState = require('../../utils/init_state');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var spec = morx
	.spec({})
	.build('collection_id', 'required: false')
	.build('borrower_first_name', 'required:false, eg:lender')
	.build('borrower_last_name', 'required:false, eg:lender')
	.build('borrower_email', 'required:false, eg:itisdeji@gmail.com')
	.build('borrower_phone', 'required:false, eg:08100455706')
	.build('borrower_bvn', 'required:false, eg:42341234552')
	.build('product_id', 'required:false, eg:lender')
	.build('tenor', 'required:false, eg:1')
	.build('amount', 'required:false, eg:1')
	.build('product_id', 'required:false, eg:1')
	.build('disbursement_mode', 'required:false, eg:1000000')
	.build('loan_status', 'required:false, eg:lender')
	.build('disbursement_date', 'required:false, eg:lender')
	.build('num_of_collections', 'required:false, eg:lender')
	.build('collection_frequency', 'required:false, eg:lender')
	.build('repayment_id', 'required:false, eg:1')
	.build('start_date', 'required:false, eg:lender')
	.end();

function service(data) {
	var d = q.defer();
	const globalUserId = data.USER_ID || 1;

	q
		.fcall(async () => {
			const validParameters = morx.validate(data, spec, {
				throw_error: true
			});
			const params = validParameters.params;

			let collection = null;
			let product = null;

			collection = await models.collection.findOne({
				where: {
					id: params.collection_id
				}
			});

			if (!collection || !collection.id) throw new Error('Could not find collection');
			if (collection.status === 'active') throw new Error('Cannot update an active collection');

			if (
				(params.start_date || collection.start_date) &&
				(params.disbursement_date || collection.disbursement_date)
			) {
				let start_date = params.start_date || collection.start_date;
				let disbursement_date = params.disbursement_date || collection.disbursement_date;
				if (
					!moment(start_date).isAfter(disbursement_date) &&
					!moment(start_date).isSame(disbursement_date, 'day')
				)
					throw new Error('Start date cannot be before disbursement date');
			}

			if (params.borrower_first_name && params.borrower_first_name.length < 3)
				throw new Error('Names must be more than 2 characters');

			if (params.borrower_last_name && params.borrower_last_name.length < 3)
				throw new Error('Names must be more than 2 characters');

			if (params.borrower_bvn) {
				assert.digitsOnly(params.borrower_bvn, null, 'BVN');
				// first verify that there is a bvn
				let url = config.utility_base_url + 'verify/bvn';
				let payload = {
					bvn: params.borrower_bvn
				};
				const requestHeaders = {
					'Content-Type': 'application/json'
				};
				let verifiedBVN = await makeRequest(url, 'POST', payload, requestHeaders, 'Verify BVN');

				if (verifiedBVN && verifiedBVN.mobile) {
				} else {
					throw new Error('Could not verify BVN');
				}

				// make request to verify phone number
				const verifiedPhone = await makeRequest(
					config.utility_base_url + 'verify/phone/',
					'POST',
					{
						phone: collection.borrower_phone
					},
					requestHeaders,
					'validate phone number'
				);
			}

			// see whether there is a product id attached to the collection or if user is trying to input one

			if (collection.product_id) {
				/*product = await models.product.findOne({
                    where: {
                        id: collection.product_id
                    }
                });*/
				// get init state
				product = await initState.getInitState('collections', collection.id);
			} else if (params.product_id) {
				product = await models.product.findOne({
					where: {
						id: params.product_id
					}
				});

				// store state
				await initState.storeState(product, 'collections', collection.id);
			} else {
				//throw new Error('You need to provide a product id to proceed');

				// if there's no product id, we are updating the stuff at the first stage
				let result = await collection.update({
					borrower_first_name: params.borrower_first_name,
					borrower_last_name: params.borrower_last_name,
					borrower_bvn: params.borrower_bvn,
					borrower_phone: params.borrower_phone
				});
				d.resolve(result);
				return d.promise;
			}

			if (!product || !product.id) throw new Error('Product does not exist');

			let tenor = params.tenor || collection.tenor;
			let tenor_type = product.tenor_type;
			let frequency = params.collection_frequency || collection.frequency;
			let collections = params.num_of_collections || collection.num_of_collections;

			if (tenor && tenor_type && frequency && collections) {
				// first , validate date thresholds
				validateDateThresholds(tenor, tenor_type, collections, frequency);

				let end_result = validateCollectionSetup(tenor, tenor_type, collections, frequency);
				let can_proceed = end_result.can_proceed;

				if (!can_proceed) {
					throw new Error(`You need to review your loan settings. With ${collections} collections, each set to occur on a ${frequency} basis, \
                    the last date of collection is (${end_result.collection_end}), which is beyond the date, (${end_result.tenor_end}, that this loan should have closed.`);
				}
			}

			if (product.status !== 'active')
				throw new Error("You cannot create a collection for a product that isn't active");
			if (product.profile_id !== data.profile.id)
				throw new Error("You can't use a product that isn't attached to this profile");

			if (params.collection_frequency) {
				let accepted = [ 'daily', 'weekly', 'monthly' ];
				if (!accepted.includes(params.collection_frequency.toLowerCase())) {
					throw new Error(`Collection frequency should be one of ${accepted.join(', ')}`);
				}
			}

			if (params.amount) {
				assert.digitsOrDecimalOnly(params.amount, null, 'Amount');
				params.amount = parseFloat(params.amount).toFixed(2);

				// make sure that the amount is not greater than the products' max or lesser than the product's min amount
				if (params.amount < parseFloat(product.min_loan_amount))
					throw new Error("Collection amount cannot be less than product's min loan amount");
				if (params.amount > parseFloat(product.max_loan_amount))
					throw new Error("Collection amount cannot be more than product's max loan amount");
			}

			if (params.tenor) {
				assert.digitsOnly(params.tenor, null, 'Tenor');

				// make sure that the tenor is not greater than the products' max or lesser than the product's min tenor
				if (parseInt(params.tenor) > parseInt(product.max_tenor))
					throw new Error("Collection tenor cannot be more than product's max tenor");

				if (parseInt(params.tenor) < parseInt(product.min_tenor))
					throw new Error("Collection tenor cannot be less than product's min tenor");
			}

			// inherit tenor type from product's tenor type
			params.tenor_type = product.tenor_type;

			if (params.borrower_phone) assert.digitsOnly(params.borrower_phone, null, 'Phone');

			if (params.borrower_email) assert.emailFormatOnly(params.borrower_email, null, 'Email');

			if (params.disbursement_date) assert.dateFormatOnly(params.disbursement_date, null, 'Disbursement Date');
			if (new Date(params.disbursement_date).getFullYear().toString() == '1970') params.disbursement_date = null;

			if (params.disbursement_mode) {
				if (![ 'cash', 'transfer' ].includes(params.disbursement_mode.toLowerCase()))
					throw new Error('Disbursement mode should be either cash or transfer');
			}
			if (params.loan_status) {
				if (![ 'disbursed', 'active', 'past_due', 'approved' ].includes(params.loan_status.toLowerCase()))
					throw new Error('Loan status should be one of disbursed, approved, active or past due');
			}
			if (params.start_date) assert.dateFormatOnly(params.start_date, null, 'Start Date');

			if (params.num_of_collections) {
				assert.digitsOnly(params.num_of_collections, null, 'No. of collections');
				assert.greaterThanZero(params.num_of_collections, null, 'Number of collections');
			}
			return [ product, collection, params ];
		})
		.spread((product, collection, params) => {
			if (!collection) throw new Error('No such product exists');

			// you can't change a loan's product id after it has been set
			if (params.product_id && collection.status === 'active')
				throw new Error('Cannot re-update product id of a created collection');

			//params.profile_id = data.profile.id
			params.modified_on = new Date();
			params.modified_by = globalUserId;

			return [
				collection.update({
					...params
				}),
				product
			];
		})
		.spread(async (collection, product) => {
			if (product.id) {
				// check whether the most essential parts of a collection are available before sending email
				if (![ 'declined', 'active' ].includes(collection.status)) {
					// make sure that you aren't detecting a collection

					//that is already considered active;
					let required_fields = [
						'product_id',
						'tenor',
						'amount',
						'tenor_type',
						'loan_status',
						'disbursement_mode',
						'disbursement_date',
						'num_of_collections',
						'collection_frequency',
						'start_date'
					];

					// see whether collection is in draft;
					let new_status = resolvers.resolveCompletionStatus(
						collection,
						required_fields,
						'draft',
						'inactive'
					);

					await collection.update({
						status: new_status
					});
				}
			}
			collection.interest = product.interest;

			let audit = new AuditLog(data.reqData, 'UPDATE', 'updated collection ' + collection.id);
			await audit.create();
			d.resolve(collection);
		})
		.catch((err) => {
			console.log(err.stack);

			d.reject(err);
		});

	return d.promise;
}
service.morxspc = spec;
module.exports = service;
