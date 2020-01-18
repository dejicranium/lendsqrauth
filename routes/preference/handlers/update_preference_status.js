var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'preference/status');
const has_role = require('mlar')('hasRoleMiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.USER_ID = req.user.id
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Preference status updated"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                                                require('mlar')('locallogger').error(req, res.statusCode, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/:preference_id"; 
vinfo.routeConfig.method = "put"; 
vinfo.routeConfig.middlewares = [
    auth_middleware,
    has_role('admin'),
    routemeta('update_preference', 'none')];
module.exports = vinfo;

