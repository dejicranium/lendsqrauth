var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'profile/report');
const profile_middleware = require('mlar')('profileVerifyMiddleware');
const has_role = require('mlar')('hasRoleMiddleware');

function vinfo(req, res, next) {
    const data = {
        ...req.body,
        ...req.query,
        ...req.headers,
        ...req.params
    };

    service(data)
        .then(response => {
            utils.jsonS(res, response, "Report");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/report";
vinfo.routeConfig.method = "get";
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware,
    routemeta('get_profile_report', 'none')
];
module.exports = vinfo;