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

function service(data){

	const d = q.defer();
    const page = data.page ? Number(data.page) : 1;
    const limit = data.limit ? parseInt(data.limit) : 20;
    const offset = page ? (page - 1) * limit : false;	
    
    data.limit = limit;
    data.offset = offset;

	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;
		let getFunction = null
        if (params.collection_id) {
            getFunction = models.collection.findOne({
                where: {
                	id: params.collection_id
                }
            })
    
		}
		else {
			let query = {limit: data.limit, offset: data.offset, where: {}}

			if (data.lender_id) query.where.lender_id = data.lender_id;
			if (data.product_id) query.where.product_id = data.product_id;
			if (data.loan_status) query.where.loan_status = data.loan_status;
			if (data.tenor) query.where.tenor = data.tenor;
			if (data.borrower_id) query.where.borrower_id = data.borrower_id;
			if (data.borrower_first_name) query.where.borrower_first_name = data.borrower_first_name;
			if (data.borrower_last_name) query.where.borrower_last_name = data.borrower_last_name;
			if (data.lender_name) query.where.num_of_collections = data.num_of_collections;
			if (data.collection_frequency) query.where.collection_frequency = data.collection_frequency;

			if (['business_lender', 'individual_lender'].includes(data.profile.role)) {
				query.where.lender_id = data.profile.id
			}
			else if (data.profile.role == 'borrower') {
				query.where.lender_id = data.profile.parent_profile_id
			}
			else if (data.profile.role == 'collaborator') {
				query.where.lender_id = data.profile.parent_profile_id
			}
				
			getFunction = models.collection.findAndCountAll(query)
		}

        return [getFunction, params]
        
	}) 
	.spread((collections, params) => { 
        if (!collections) throw new Error("No such product");
		// if one, check who is making the request
		if (params.collection_id) {
			let collection = collections

			let collection_creator = collection.lender_id
			let collection_borrower = collection.borrower_id

			if (['business_lender', 'individual_lender'].includes(data.profile.role) && collection_creator != data.profile.id) {
				throw new Error("Cannot get collection that your profile didn't create")
			}
			
			else if (data.profile.role == 'borrower' && collection_borrower != data.profile.id) {
				throw new Error ("You aren't a borrower on this collection")
			}

			else if (data.profile.role == 'collaborator' && collection_creator !== data.profile.parent_profile_id) {
				throw new Error("You aren't a collaborator on the profile that created this collection")
			}
			
			d.resolve(collections)
		}

		d.resolve(paginate(collections.rows, 'collections', collections.count, limit, page))
		    
    })
	.catch( (err) => {

		d.reject(err);

	});

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
