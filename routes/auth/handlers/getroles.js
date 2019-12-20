var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/listroles');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const has_role = require('mlar')('hasRoleMiddleware');
const profile_middleware = require('mlar')('profileVerifyMiddleware');

function vinfo(req, res, next){ 
        const data = {...req.query};
        
        service(data)
        .then(response => {
            utils.jsonS(res, req.profile, "Roles");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/roles"; 
vinfo.routeConfig.method = "get"; 
vinfo.routeConfig.middlewares = [
    auth_middleware ,
    profile_middleware,
    //has_role('admin'), 
    routemeta('auth_get_roles', 'none')];
module.exports = vinfo;

