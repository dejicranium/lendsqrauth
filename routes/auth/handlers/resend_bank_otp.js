var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/resend_bank_otp');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const has_perm_middleware = require('mlar')('hasPermMiddleware');

function vinfo(req, res, next){ 
        const data = {...req.query, ...req.body, ...req.headers};
        data.user = req.user;
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Process completed successfully"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/bankotp/resend"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [
    auth_middleware,
     routemeta('resendbankotp', 'none')];
module.exports = vinfo;

