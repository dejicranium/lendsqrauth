const models = require('mlar')('models');
const q = require('q');
const paginate = require('mlar')('paginate');
const moment = require('moment');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;

function service(data) {

    const d = q.defer();
    const page = data.page ? parseInt(data.page) : 1;
    const limit = data.limit ? parseInt(data.limit) : 20;
    const offset = page ? (page - 1) * limit : false;


    let params = {};

    params.offset = offset;
    params.limit = limit;
    params.attributes = {};
    params.attributes.exclude = ['password', ...DEFAULT_EXCLUDES, 'business_name', 'active', 'deleted', 'disabled']


    // for filter conditions 
    params.where = {};


    // include the profiles of the user
    params.include = [{
        model: models.profile,
        required: false,
        include: [{
            model: models.role,
            required: true
        }]
    }];

    if (data.first_name) {
        params.where.first_name = {
            $like: '%' + data.first_name + '%'
        }

    }
    if (data.last_name) {
        params.where.last_name = {
            $like: '%' + data.last_name + '%'
        }
    }
    if (data.phone) {
        params.where.phone = {
            $like: '%' + data.phone + '%'
        }
    }
    if (data.email) {
        params.where.email = {
            $like: '%' + data.email + '%'
        }
    }
    if (data.business_name) {
        params.where.business_name = {
            $like: '%' + data.business_name + '%'
        }
    }

    /*
        if (data.role) {
            params.include[0].where = data.role;
        }*/

    if (data.active) {
        params.where.active = 1;
    }

    if (data.disabled) {
        params.where.disabled = 1;
    }
    if (data.deleted) {
        params.where.deleted = 1;
    }
    if (data.from && data.to) {
        let start = moment(moment(data.from).format('YYYY-MM-DD') + ' 00:00:00', moment.ISO_8601)
        let stop = moment(moment(data.to).format('YYYY-MM-DD') + ' 23:59:59', moment.ISO_8601);

        params.where.created_on = {
            $gte: start.toISOString(),
            $lte: stop.toISOString()
        }
    }

    if (data.status) {
        data.where.status = data.status
    }

    if (data.search) {
        params.where = {
            $or: [{
                    last_name: {
                        $like: '%' + data.search + '%'
                    }
                },
                {
                    first_name: {
                        $like: '%' + data.search + '%'
                    }
                },
                {
                    email: {
                        $like: '%' + data.search + '%'
                    }
                },
                {
                    first_name: {
                        $like: '%' + data.search + '%'
                    }
                },
                {
                    business_name: {
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

    params.order = [
        ['id', 'DESC']
    ]

    q.fcall(async () => {
            return models.user.findAndCountAll(params)
        })
        .then((users) => {
            if (!users) throw new Error("Couldn't fetch users");
            d.resolve(paginate(users.rows, 'users', users.count, limit, page))
        })
        .catch((err) => {
            d.reject(err);
        });

    return d.promise;

}
module.exports = service;