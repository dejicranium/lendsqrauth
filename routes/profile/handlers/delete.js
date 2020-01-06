var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'profile/delete');
const profile_middleware = require('mlar')('profileVerifyMiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.user = req.user;
        data.profile = req.profile;
        data.reqData = req;
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Profile deleted"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/:profile_id"; 
vinfo.routeConfig.method = "delete"; 
vinfo.routeConfig.middlewares = [auth_middleware, profile_middleware, routemeta('delete_profile', 'none')];
module.exports = vinfo;

