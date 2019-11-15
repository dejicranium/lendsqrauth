var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/updaterole');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');


function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        
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
vinfo.routeConfig.middlewares = [auth_middleware, routemeta('auth_update_role', 'none')];
module.exports = vinfo;

