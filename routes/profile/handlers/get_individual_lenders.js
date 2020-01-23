var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'profile/get_lenders');
const profile_middleware = require('mlar')('profileVerifyMiddleware');
const has_role = require('mlar')('hasRoleMiddleware');


function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.user = req.user;
        data.profile = req.profile;
        data.type = 'individual_lender';
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Profile"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                                                
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/individual-lenders"; 
vinfo.routeConfig.method = "get"; 
vinfo.routeConfig.middlewares = [
    auth_middleware, 
    profile_middleware,
    has_role('admin'),
    routemeta('get_individual_lenders', 'none')];
module.exports = vinfo;

