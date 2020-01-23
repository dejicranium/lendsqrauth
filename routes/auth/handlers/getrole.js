var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/getrole');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const has_role = require('mlar')('hasRoleMiddleware');
const profile_middleware = require('mlar')('profileVerifyMiddleware');
const addResponseAuthDetails = require('mlar')('addResponseAuthDetails');

function vinfo(req, res, next) {
    const data = {
        ...req.body,
        ...req.query,
        ...req.headers,
        ...req.params
    };

    service(data)
        .then(response => {
            utils.jsonS(res, response, "User role");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
            
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/roles/:role_id";
vinfo.routeConfig.method = "get";
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware,
    addResponseAuthDetails,
    has_role('admin'),
    routemeta('auth_get_role', 'none')
];
module.exports = vinfo;