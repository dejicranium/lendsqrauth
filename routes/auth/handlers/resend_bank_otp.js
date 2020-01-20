var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/resend_bank_otp');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const has_perm_middleware = require('mlar')('hasPermMiddleware');
const profile_verify = require('mlar')('profileVerifyMiddleware');

function vinfo(req, res, next){ 
        const data = {...req.query, ...req.body, ...req.headers};
        data.user = req.user;
        data.profile = req.profile;
        data.reqData = req;
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Process completed successfully"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
                                    require('mlar')('locallogger').error(req, res.statusCode, error.message);
 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/bankotp/resend"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_verify,
     routemeta('resendbankotp', 'none')];
module.exports = vinfo;

