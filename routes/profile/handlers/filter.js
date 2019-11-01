var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'profile/get');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.filter = true;
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Profile list"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/"; 
vinfo.routeConfig.method = "get"; 
vinfo.routeConfig.middlewares = [auth_middleware, routemeta('get_profile_type', 'none')];
module.exports = vinfo;

