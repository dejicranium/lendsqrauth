var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/inviteuser');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const has_perm_middleware = require('mlar')('hasPermMiddleware');
const profile_middleware = require('mlar')('profileVerifyMiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.header, ...req.params, ...req.query};
        data.profile = req.profile;
        data.user = req.user;
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Created"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/team/invite"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [
    auth_middleware, 
    profile_middleware,
    routemeta('add_team_member', 'none')];
module.exports = vinfo;

