const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const moment = require('moment')
const paginate = require('mlar')('paginate');

var spec = morx.spec({})
    .build('from', 'required:false, eg:nothing')
    .build('to', 'required:false, eg:nothing')


    .end();

function service(data) {

    var d = q.defer();
    const globalUserId = data.USER_ID || 1;
    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;
            const page = data.page ? Number(data.page) : 1;
            const limit = data.limit ? Number(data.limit) : 20;
            const offset = page ? (page - 1) * limit : false;

            data.limit = limit;
            data.offset = offset;
            data.where = {

            }

            if (data.search) {
                data.where.borrower_name = {
                    $like: '%' + data.search + '%'
                }
            }


            if (data.to && data.from) {
                let start = moment(moment(queryData.from).format('YYYY-MM-DD') + ' 00:00:00', moment.ISO_8601);
                let stop = moment(moment(queryData.to).format('YYYY-MM-DD') + ' 23:59:59', moment.ISO_8601)
                data.where.createdAt.$gte = start;
                data.where.createdAt.$lte = stop;

            }

            if (data.status) {
                data.where.status = data.status;
                delete data.status;
            }

            if (data.profile_id) {
                data.where.inviter_id = data.profile_id;
                delete data.inviter_id;
            }

            if (data.collection_id) {
                data.where.collection_id = data.collection_id
                delete data.collection_id;
            }

            data.attributes = {
                exclude: ['token', 'token_is_used', ]
            }

            if (data.profile.role !== 'admin') {
                //
                data.where.inviter_id = data.profile.id
            }

            data.include = [{
                model: models.collection,
                attributes: ['id', 'product_id'],
                /*include: {
                    model: models.product
                },*/
            }]

            data.order = [
                ['id', 'DESC']
            ]

            return [models.borrower_invites.findAndCountAll(data), data];

        })
        .spread(async (borrower_invites, data) => {
            if (!borrower_invites) throw new Error("No schedules available");
            borrower_invites.rows = JSON.parse(JSON.stringify(borrower_invites.rows));

            let collection_ids = borrower_invites.rows.map(iv => iv.collection_id);

            let initStates = await models.collection_init_state.findAll({
                where: {
                    collection_id: collection_ids
                }
            })
            borrower_invites.rows.map(iv => {
                let product_state = initStates.find(s => s.collection_id == iv.collection_id);
                if (product_state) {
                    product_state = JSON.parse(product_state.state)
                    iv.collection.product = product_state;
                    return iv;
                }
            })
            d.resolve(paginate(borrower_invites.rows, 'invitations', borrower_invites.count, Number(data.limit), data.page));
        })
        .catch((err) => {

            d.reject(err);

        });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;