var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'audit/get');
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
            utils.jsonS(res, response, "Audit");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/:id(\\d+)";
vinfo.routeConfig.method = "get";
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware,
    has_role('admin'),
    routemeta('get_product', 'none')
];
module.exports = vinfo;