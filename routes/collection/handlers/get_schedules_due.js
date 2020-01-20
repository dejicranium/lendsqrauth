var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'collection/get_schedules_due');
const profile_middleware = require('mlar')('profileVerifyMiddleware');

function vinfo(req, res, next) {
    const data = {
        ...req.body,
        ...req.query,
        ...req.headers,
        ...req.params
    };
    data.user = req.user
    data.profile = req.profile
    service(data)
        .then(response => {
            utils.jsonS(res, response, "Schedules");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
                                                require('mlar')('locallogger').error(req, res.statusCode, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/schedules/due";
vinfo.routeConfig.method = "get";
vinfo.routeConfig.middlewares = [

    routemeta('get_collection_schedule_due', 'none')
];
module.exports = vinfo;