var utils = require('mlar')('mt1l');
const signupService = require('mlar').mreq('services', 'auth/signup');
const routemeta = require('mlar')('routemeta');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        
        signupService(data)
        .then(response => {
            utils.jsonS(res, null, "User account created successfully"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/signup"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [ routemeta('auth_sign_up', 'none')];
module.exports = vinfo;

