var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/setrole');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        
        service(data)
        .then(response => {
            utils.jsonS(res, response, "User role has been updated successfully"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                                    
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/role/:role_id([0-9]{25})/:user_id([0-9]{25})"; 
vinfo.routeConfig.method = "put"; 
vinfo.routeConfig.middlewares = [auth_middleware,  routemeta('auth_set_role', 'none')];
module.exports = vinfo;

