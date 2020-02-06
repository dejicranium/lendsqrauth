const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const paginate = require('mlar')('paginate');
const DEFAULT_EXCLUDES = require('mlar')('appvalues').DEFAULT_EXCLUDES;

var spec = morx.spec({})

    .build('id', 'required:false, eg:lender')

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

        if (params.id) {
            return [models.audit_log.findOne({where: {id: params.id},include: [{model: models.user, attributes:{exclude: DEFAULT_EXCLUDES}}]
            }), params]
        }
        else {
            return[

                 models.audit_log.findAndCountAll({
                    limit,
                    offset,
                     include: [{model: models.user, attributes:{exclude: DEFAULT_EXCLUDES}}]
                }),

                params
            ]

        }

    }).spread((resp, params)=> {
        if (!resp) {
            if (params.id) {d.resolve({})}
            else d.resolve([]);
        }

        else if (params.id) {
            resp = JSON.parse(JSON.stringify(resp));
            resp.actor_meta = JSON.parse(resp.actor_meta);
            resp.verbose_description = '';
            if (resp.user && (resp.user.first_name || resp.user.business_name)) {
                let full_name = resp.user.first_name ? resp.user.first_name + " " + resp.user.last_name : resp.business_name;
                resp.verbose_description = full_name + " " + resp.action;
            }
            else if (resp.actor_id) {
                resp.verbose_description = "User " + resp.actor_id + " " + resp.action;
            }
            else {
                resp.verbose_description + "Anonymous user " + resp.action;
            }
            d.resolve(resp);
        }
        else {
            resp = JSON.parse(JSON.stringify(resp));

            resp.rows.map(r=> {
                r.actor_meta = JSON.parse(r.actor_meta);
                r.verbose_description = '';
                if (r.user && (r.user.first_name || r.user.business_name)) {
                    let full_name = r.user.first_name ? r.user.first_name + " " + r.user.last_name : r.business_name;
                    r.verbose_description = full_name + " " + r.action;
                }
                else if (r.actor_id) {
                    r.verbose_description = "User " + r.actor_id + " " + r.action;
                }
                else {
                    r.verbose_description + "Anonymous user " + r.action;
                }
                return r;
            });
            d.resolve(paginate(resp.rows, 'logs', resp.count, limit, page));
        }
    })
    .catch((err) => {
        console.log(err.stack)
        d.reject(err);

    });

    return d.promise;

}
service.morxspc = spec;
module.exports = service;