var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'collection/get_schedules');
const profile_middleware = require('mlar')('profileVerifyMiddleware');
const has_role = require('mlar')('hasRoleMiddleware');

function vinfo(req, res, next) {
    const data = {
        ...req.body,
        ...req.query,
        ...req.headers,
        ...req.params
    };
    data.user = req.user;
    data.profile = req.profile;
    service(data)
        .then(response => {
            utils.jsonS(res, response, "Schedules");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/schedules";
vinfo.routeConfig.method = "get";
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware,
    has_role(['individual_lender', 'business_lender', 'borrower', 'admin']),
    routemeta('get_collection_schedules', 'none')
];
module.exports = vinfo;