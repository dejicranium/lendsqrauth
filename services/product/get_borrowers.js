const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const bcrypt = require('bcrypt');
const validators = require('mlar')('validators');
const obval = require('mlar')('obval');
const assert = require('mlar')('assertions');
const crypto = require('crypto');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;
const moment = require('moment');
const paginate = require('mlar')('paginate');

var spec = morx.spec({})
    .build('profile_id', 'required:false,eg:1')
    .build('product_id', 'required:false,eg:1')
    .end();

function service(data) {

    var d = q.defer();
    const page = data.page ? Number(data.page) : 1;
    const limit = data.limit ? Number(data.limit) : 20;
    const offset = page ? (page - 1) * limit : false;

    data.limit = limit;
    data.offset = offset;

    q.fcall(async () => {
            var validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            let params = validParameters.params;





            // filter by product - id : returns an object
            if (params.product_id) {
                data.fetch_one = true;
                data.where = {
                    id: params.product_id
                }
                data.include = [{
                    model: models.collection,
                    attributes: ['id'],
                    where: {
                        status: 'active'
                    },
                    required: false
                }]

                return [models.product.findOne(data), data]
            }

            data.where = {};

            // else get all products in the system


            // for call to get all products, allow admin and borrowers to see all products
            if (!['admin', 'borrower'].includes(data.profile.role)) {
                data.where = {
                    profile_id: data.profile.id
                }
            } else {
                if (data.profile_id) data.where.profile_id = data.profile_id
            }

            if (data.product_name) data.where.product_name = {
                $like: '%' + data.product_name + '%'
            }
            if (data.product_description) data.where.product_description = {
                $like: '%' + data.product_description + '%'
            }
            if (data.repayment_model) data.where.repayment_model = {
                $like: '%' + data.repayment_model + '%'
            }
            if (data.min_loan_amount) data.where.min_loan_amount = data.min_loan_amount
            if (data.max_loan_amount) data.where.max_loan_amount = data.max_loan_amount
            if (data.tenor_type) data.where.tenor_type = data.tenor_type
            if (data.interest) data.where.interest = data.interest

            data.include = [{
                    model: models.collection,
                    attributes: ['id'],
                    where: {
                        status: 'active'
                    },

                    required: false,

                },
                {
                    model: models.profile,
                    attributes: ['id'],
                    include: [{
                        model: models.user,
                        attributes: [
                            'first_name',
                            'last_name',
                        ]
                    }]
                }
            ] // do not show deleted products 
            data.where.status = {
                $ne: 'deleted'
            }
            if (['borrower'].includes(data.profile.role)) {
                data.where.status = {
                    $notIn: ['draft', 'inactive']
                };
            }
            if (data.status) data.where.status = {
                $like: '%' + data.status + '%'
            }
            data.order = [
                ['id', 'DESC']
            ]
            return [
                models.product.findAndCountAll(data),
                data
            ]

        })
        .spread((products, data) => {
            if (!products) throw new Error("No products to show");

            if (data.fetch_one !== undefined) {
                products = JSON.parse(JSON.stringify(products));
                products.num_of_borrowers = products.collections.length;



                /// get borrowers
                let borrower_images = []
                let borrowers = products.collections.map(c => c.borrower_id);

                borrowers = await models.profile.findAll({
                    where: {
                        id: {
                            $in: borrowers
                        }
                    },
                    include: [{
                        model: model.users
                    }]
                })
                if (borrowers) {
                    let images = borrowers.users.filter(u => u.image !== null);
                    let not_null_images = images.filter(image => image != null);

                    borrower_images = not_null_images;

                    if (not_null_images.lengths < 6 && images.length > 5) {
                        images.forEach(image => {
                            if (!not_null_images.include(image)) {
                                borrower_images.push(image)
                            }
                        })
                    }

                }
                delete products.collections;




                products.borrower_images = borrower_images;


                d.resolve(products);
            }

            products.rows = JSON.parse(JSON.stringify(products.rows))
            products.rows.map(p => {
                p.num_of_borrowers = p.collections.length;
                delete p.collections;
                return p;
            })

            /// get borrowers
            let borrower_images = []
            let borrowers = products.rows.collections.map(c => c.borrower_id);
            borrowers = await models.profile.findAll({
                where: {
                    id: {
                        $in: borrowers
                    }
                },
                include: [{
                    model: model.users
                }]
            })
            if (borrowers) {
                let images = borrowers.users.filter(u => u.image !== null);
                let not_null_images = images.filter(image => image != null);

                borrower_images = not_null_images;

                if (not_null_images.lengths < 6 && images.length > 5) {
                    images.forEach(image => {
                        if (!not_null_images.include(image)) {
                            borrower_images.push(image)
                        }
                    })
                }

            }
            delete products.collections;




            products.borrower_images = borrower_images;

            d.resolve(paginate(products.rows, 'products', products.count, data.limit, data.page));
        })
        .catch((err) => {
            d.reject(err);
        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;