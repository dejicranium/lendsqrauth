var utils = require('mlar')('mt1l');
const forgotpassword = require('mlar').mreq('services', 'auth/completeregistration');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');



function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.reqData = req;
        forgotpassword(data)
        .then(response => {
            utils.jsonS(res, response, "The process completed successfully"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/collaborator/signup"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [routemeta('collaborator_signup', 'none')];
module.exports = vinfo;

