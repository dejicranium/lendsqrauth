var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/blacklistuser');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const has_role = require('mlar')('hasRoleMiddleware');
const profile_middleware = require('mlar')('profileVerifyMiddleware');

function vinfo(req, res, next) {
    const data = {
        ...req.body,
        ...req.query,
        ...req.headers,
        ...req.params
    };

    service(data)
        .then(response => {
            utils.jsonS(res, response, "User has been blacklisted successfully");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/admin/users/:user_id/blacklist";
vinfo.routeConfig.method = "put";
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware,
    has_role('admin'),
    routemeta('auth_delete_user', 'none')
];
module.exports = vinfo;