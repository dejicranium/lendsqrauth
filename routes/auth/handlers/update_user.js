var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/update_user');
const routemeta = require('mlar')('routemeta');
const profile_verify = require('mlar')('profileVerifyMiddleware');
const auth_middleware = require('mlar')('authmiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.user = req.user;
        data.profile = req.profile;
        data.reqData = req;

        service(data)
        .then(response => {
            utils.jsonS(res, response, "Update was successful"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                                    require('mlar')('locallogger').error(req, res.statusCode, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/users"; 
vinfo.routeConfig.method = "put"; 
vinfo.routeConfig.middlewares = [
    auth_middleware, 
    profile_verify,
    routemeta('auth_update_user', 'none')
];
module.exports = vinfo;

