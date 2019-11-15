var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'preference/delete');
const has_role = require('mlar')('hasRoleMiddleware');
const profile_middleware = require('mlar')('profileVerifyMiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.USER_ID = req.user.id
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Preference deleted"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/:preference_id"; 
vinfo.routeConfig.method = "delete"; 
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware,

    has_role('admin'),
    routemeta('create_collection', 'none')];
module.exports = vinfo;

