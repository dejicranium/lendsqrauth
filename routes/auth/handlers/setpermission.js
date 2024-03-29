var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const profile_verify = require('mlar')('profileVerifyMiddleware');

const service = require('mlar').mreq('services', 'auth/setpermission');
function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.user = req.user;
        data.profile = req.profile;
        data.reqData = req;

        service(data)
        .then(response => {
            utils.jsonS(res, response, "Permission set"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                                    
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/permissions"; 
vinfo.routeConfig.method = "put"; 
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_verify,
    routemeta('auth_set_permission', 'none')];
module.exports = vinfo;

