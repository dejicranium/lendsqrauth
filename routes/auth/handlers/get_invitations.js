var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'auth/getinvitations');
const has_role = require('mlar')('hasRoleMiddleware');
const profile_verify = require('mlar')('profileVerifyMiddleware');
const block_role = require('mlar')('blockRoleMiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.user = req.user;
        data.profile = req.profile;
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Invitations"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/team/invitations"; 
vinfo.routeConfig.method = "get"; 
vinfo.routeConfig.middlewares = [
    auth_middleware, 
    profile_verify,
    block_role('borrower'),
    routemeta('get_invitations', 'none')];
module.exports = vinfo;

