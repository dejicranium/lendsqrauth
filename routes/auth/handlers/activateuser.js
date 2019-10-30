var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/changestatus');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.status = 'activate';
        service(data)
        .then(response => {
            utils.jsonS(res, response, "User account has been updated successfully"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/user/:user_id/activate"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [auth_middleware, routemeta('auth_activate_user', 'none')];
module.exports = vinfo;

