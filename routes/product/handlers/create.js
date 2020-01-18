var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'product/create');
const profile_middleware = require('mlar')('profileVerifyMiddleware');
const has_role = require('mlar')('hasRoleMiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.profile = req.profile;
        data.user = req.user;
        data.reqData = req;

        service(data)
        .then(response => {
            utils.jsonS(res, response, "Product created"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                                                require('mlar')('locallogger').error(req, res.statusCode, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [
    auth_middleware, 
    profile_middleware,
    has_role(['individual_lender', 'business_lender']),
    routemeta('create_product', 'none')];
module.exports = vinfo;

