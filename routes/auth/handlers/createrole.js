var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'auth/createrole');
const has_role = require('mlar')('hasRoleMiddleware');
const profile_verify = require('mlar')('profileVerifyMiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.user = req.user;
        data.profile = req.profile;
        data.reqData = req;
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Role created"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                                    
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/roles"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [
    auth_middleware, 
    profile_verify,
    has_role('admin'), 
    routemeta('auth_create_role', 'none')];
module.exports = vinfo;

