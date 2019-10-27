var utils = require('mlar')('mt1l');
const signupService = require('mlar').mreq('services', 'auth/signup');
const routemeta = require('mlar')('routemeta');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        
        signupService(data)
        .then(response => {
            utils.jsonS(res, response.data, "Password resent has been sent to user's email"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/password/forgot"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [routemeta('auth_forgot_password', 'none')];
module.exports = vinfo;

