var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const profile_middleware = require('mlar')('profileVerifyMiddleware');
const service = require('mlar').mreq('services', 'profile/get_lender_types');
const has_role = require('mlar')('hasRoleMiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.profile = req.profile;

        data.user = req.user;
        service(data)
        .then(response => {
            utils.jsonS(res, response, "types"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                                                
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/lenders/types"; 
vinfo.routeConfig.method = "get"; 
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware,
    has_role('admin'), 
    routemeta('get_me', 'none')
];
module.exports = vinfo;

