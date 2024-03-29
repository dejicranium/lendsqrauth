var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'product/get');
const profile_middleware = require('mlar')('profileVerifyMiddleware');
const has_role = require('mlar')('hasRoleMiddleware');

function vinfo(req, res, next) {
    const data = {
        ...req.body,
        ...req.query,
        ...req.headers,
        ...req.params
    };
    data.profile = req.profile;
    service(data)
        .then(response => {
            utils.jsonS(res, response, "Products");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/";
vinfo.routeConfig.method = "get";
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware,
    has_role(['admin', 'individual_lender', 'business_lender', 'collaborator']),
    routemeta('get_products', 'none')
];
module.exports = vinfo;