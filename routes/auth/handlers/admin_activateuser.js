var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/changestatus');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const profile_middleware = require('mlar')('profileVerifyMiddleware');

const has_role = require('mlar')('hasRoleMiddleware');

function vinfo(req, res, next) {
    const data = {
        ...req.body,
        ...req.query,
        ...req.headers,
        ...req.params
    };
    data.status = 'activate';
    data.profile = req.profile;
    data.reqData = req;
    service(data)
        .then(response => {
            utils.jsonS(res, response, "User account has been updated successfully");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/admin/users/:user_id/activate";
vinfo.routeConfig.method = "post";
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware,
    has_role('admin'),
    routemeta('auth_activate_user', 'none')
];
module.exports = vinfo;