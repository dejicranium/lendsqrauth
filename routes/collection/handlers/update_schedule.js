var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'collection/update_collection_schedule');
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
                                                
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/schedules/:schedule_id(\\d+)";
vinfo.routeConfig.method = "put";
vinfo.routeConfig.middlewares = [
    routemeta('get_collection_schedules', 'none')
];
module.exports = vinfo;