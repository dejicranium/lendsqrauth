var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'profile/create');

function vinfo(req, res, next){ 
        let data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.user_id = req.user.id;
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Profile created"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [auth_middleware, routemeta('profile_create', 'none')];
module.exports = vinfo;

