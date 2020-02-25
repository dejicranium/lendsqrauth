var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/getpermissions');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const has_perm_middleware = require('mlar')('hasPermMiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Permissions list"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                                    
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/permissions"; 
vinfo.routeConfig.method = "get"; 
vinfo.routeConfig.middlewares = [auth_middleware, routemeta('get_permission', 'none')];
module.exports = vinfo;

