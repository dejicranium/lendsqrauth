var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/listusers');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const has_perm_middleware = require('mlar')('hasPermMiddleware');

function vinfo(req, res, next){ 
        const data = {...req.query};
        
        service(data)
        .then(response => {
            utils.jsonS(res, response, "User list"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/users"; 
vinfo.routeConfig.method = "get"; 
vinfo.routeConfig.middlewares = [auth_middleware, routemeta('get_users', 'none')];
module.exports = vinfo;

