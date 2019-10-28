var utils = require('mlar')('mt1l');
const signupService = require('mlar').mreq('services', 'auth/signin');
const routemeta = require('mlar')('routemeta');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        
        signupService(data)
        .then(response => {
            utils.jsonS(res, response.data, "User login successful"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/signin"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [routemeta('auth_signin', 'none')];
module.exports = vinfo;

