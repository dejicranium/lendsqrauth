var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'collection/borrower_redirect');
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
    data.user = req.user;
    data.reqData = req;

    service(data)
        .then(response => {
            utils.jsonS(res, response, "Collection");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/borrower-redirect";
vinfo.routeConfig.method = "get";
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware,
    has_role('borrower'),
    routemeta('borrower-redirect', 'none')
];
module.exports = vinfo;