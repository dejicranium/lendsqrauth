var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'profile/get_borrowers');
const profile_middleware = require('mlar')('profileVerifyMiddleware');
const block_role = require('mlar')('blockRoleMiddleware')

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.profile = req.profile;
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Profile"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                                                
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/borrowers"; 
vinfo.routeConfig.method = "get"; 
vinfo.routeConfig.middlewares = [
    auth_middleware, 
    profile_middleware,
    block_role('borrower'),
    routemeta('get_borrowers', 'none')];
module.exports = vinfo;

