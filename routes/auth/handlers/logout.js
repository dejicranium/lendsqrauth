var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/logout');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.USERID = req.user.id;
        service(data)
        .then(response => {
            utils.jsonS(res, response, "User logged out successfully"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/logout"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [auth_middleware, routemeta('auth_logout', 'none')];
module.exports = vinfo;

