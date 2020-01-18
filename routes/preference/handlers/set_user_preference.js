var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'preference/create');
const profile_middleware = require('mlar')('profileVerifyMiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.USER_ID = req.user.id;
        data.for = 'user';

        service(data)
        .then(response => {
            utils.jsonS(res, response, "Preference set"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                                                require('mlar')('locallogger').error(req, res.statusCode, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/users/:user_id"; 
vinfo.routeConfig.method = "put"; 
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware,
    routemeta('set_user_preference', 'none')];
module.exports = vinfo;

