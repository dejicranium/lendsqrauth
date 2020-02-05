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

    let response = {
        has_completed_profile: false,
        has_completed_bank_details: false,
        has_created_loan_product: false,
        has_created_collection: false
    }

    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;

            return models.profile.findOne({
                where: {
                    id: data.profile.id
                },
                include: [{
                    model: models.user,
                }, {
                    model: models.business_info
                }]
            });

            // has 
        })
        .then(async (profile) => {
            // return true for both collaborators and borrowers
            if (['borrower', 'collaborator'].includes(data.profile.role)) {
                d.resolve({
                    has_completed_profile: true,
                    has_completed_bank_details: true,
                    has_created_loan_product: true,
                    has_created_collection: true
                })
                return d.promise
            }

            let business_required_fields = ['business_name', 'tin_number', 'rc_number', 'business_address', 'state', 'country', 'business_phone']
            let user_required_fields = ['first_name', 'last_name', 'phone'];

            if (data.profile.role == 'business_lender') {
                try {
                    user_required_fields.forEach(field => {
                        if (!profile.user[field]) {
                            throw new Error("Can't create product until profile information is completed")
                        }
                    });
                    business_required_fields.forEach(field => {
                        if (!profile.business_info[field]) {
                            throw new Error("Can't create product until business information is completed")
                        }
                    });
                    response.has_completed_profile = true
                } catch (e) {
                    response.has_completed_profile = false
                    d.resolve(response);
                    return d.promise
                }
            } else if (data.profile.role === 'individual_lender') {
                try {
                    user_required_fields.forEach(field => {
                        if (!profile.user[field]) {
                            throw new Error("Can't create product until profile information is completed")
                        }
                    });
                    response.has_completed_profile = true
                } catch (e) {
                    response.has_completed_profile = false
                    d.resolve(response)
                    return d.promise
                }
            }
            // continue with check;
            let bankdetails = await models.user_bank.findOne({
                where: {
                    user_id: data.user.id
                }
            })

            if (bankdetails && bankdetails.id) {
                response.has_completed_bank_details = true
            } else {
                d.resolve(response);
                return d.promise;
            }


            let product = await models.product.findOne({
                where: {
                    profile_id: data.profile.id
                }
            })

            if (product && product.id) {
                response.has_created_loan_product = true
            } else {
                d.resolve(response);
                return d.promise;
            }

            let collection = await models.collection.findOne({
                where: {
                    lender_id: data.profile.id
                }
            })

            if (collection && collection.id) {
                response.has_created_collection = true
            } else {
                d.resolve(response);
                return d.promise;
            }

            d.resolve(response)
        })
        .catch((err) => {
            console.log(err.stack)
            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;