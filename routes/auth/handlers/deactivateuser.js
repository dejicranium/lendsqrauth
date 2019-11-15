var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/changestatus');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const has_role = require('mlar')('hasRoleMiddleware');
const profile_middleware = require('mlar')('profileVerifyMiddleware');
function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.status = 'deactivate';
        service(data)
        .then(response => {
            utils.jsonS(res, response, "User account has been updated successfully"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/users/:user_id/deactivate"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [
    auth_middleware, 
    profile_middleware, 
    has_role('admin'), 
    routemeta('auth_deactivate_user', 'none')];
module.exports = vinfo;

