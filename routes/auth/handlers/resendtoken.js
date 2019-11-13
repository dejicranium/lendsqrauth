var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/checktoken');
const routemeta = require('mlar')('routemeta');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Resent token"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/token/resend"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [routemeta('auth_resend_token', 'none')];
module.exports = vinfo;

