var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/resendtoken.auth_required');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
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
            utils.jsonS(res, response, "Resent token");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
                                    require('mlar')('locallogger').error(req, res.statusCode, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/tokenx/resend";
vinfo.routeConfig.method = "post";
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware,
    routemeta('auth_resend_token', 'none')
];
module.exports = vinfo;