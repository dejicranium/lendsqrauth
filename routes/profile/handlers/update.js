var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'profile/update');
const profile_middleware = require('mlar')('profileVerifyMiddleware');

function vinfo(req, res, next) {
    const data = {
        ...req.body,
        ...req.query,
        ...req.headers,
        ...req.params
    };

    data.user = req.user;
    data.profile = req.profile;
    data.reqData = req;

    service(data)
        .then(response => {
            utils.jsonS(res, response, "Profile updated");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/:profile_id";
vinfo.routeConfig.method = "put";
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware,
    routemeta('profile_update', 'none')
];
module.exports = vinfo;