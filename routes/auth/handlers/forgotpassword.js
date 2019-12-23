var utils = require('mlar')('mt1l');
const forgotpassword = require('mlar').mreq('services', 'auth/forgotpassword');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');



function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.reqData = req;
        forgotpassword(data)
        .then(response => {
            utils.jsonS(res, response.data, "Please check your email for a link to reset your password"); 
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

