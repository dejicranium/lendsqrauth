var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/updaterole');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const profile_middleware = require('mlar')('profileVerifyMiddleware');
const has_role = require('mlar')('hasRoleMiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.reqData = req;

        service(data)
        .then(response => {
            utils.jsonS(res, response, "Role updated successfully"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                                    
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/roles/:role_id/update"; 
vinfo.routeConfig.method = "put"; 
vinfo.routeConfig.middlewares = [
    auth_middleware, 
    profile_middleware,
    has_role('admin'),
    routemeta('auth_update_role', 'none')];
module.exports = vinfo;

