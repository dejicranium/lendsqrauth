var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'preference/get');
const has_role = require('mlar')('hasRoleMiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.user_id = req.user.id;

        service(data)
        .then(response => {
            utils.jsonS(res, response, "Preferences"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                                                require('mlar')('locallogger').error(req, res.statusCode, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/users/:user_id"; 
vinfo.routeConfig.method = "get"; 
vinfo.routeConfig.middlewares = [
    auth_middleware,
    routemeta('get_users_preferences', 'none')];
module.exports = vinfo;

