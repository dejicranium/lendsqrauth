
var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'profile/choose');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.user = req.user;
        data.reqData = req;
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Profile chosen successfully"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
                                                 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/choose"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [auth_middleware, routemeta('profile_choose', 'none')];
module.exports = vinfo;

