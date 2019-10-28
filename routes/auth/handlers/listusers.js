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
vinfo.routeConfig.path = "/users"; 
vinfo.routeConfig.method = "get"; 
vinfo.routeConfig.middlewares = [routemeta('get_users', 'none')];
module.exports = vinfo;

