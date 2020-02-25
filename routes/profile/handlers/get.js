var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const profile_middleware = require('mlar')('profileVerifyMiddleware');
const service = require('mlar').mreq('services', 'profile/get');

function vinfo(req, res, next) {
    const data = {
        ...req.body,
        ...req.query,
        ...req.headers,
        ...req.params
    };
    data.profile = req.profile;
    data.user = req.user;
    service(data)
        .then(response => {
            utils.jsonS(res, response, "Profile");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
                                                
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/:profile_id(\\d+)";
vinfo.routeConfig.method = "get";
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware,
    routemeta('get_profile', 'none')
];
module.exports = vinfo;