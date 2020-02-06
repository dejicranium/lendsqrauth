var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const profile_middleware = require('mlar')('profileVerifyMiddleware');
const service = require('mlar').mreq('services', 'dashboard/admin/borrower_stats');
const has_role = require('mlar')('hasRoleMiddleware');
const lendlog = require('mlar')('locallogger');

function vinfo(req, res, next) {
    const data = {
        ...req.body,
        ...req.query,
        ...req.headers,
        ...req.params
    };
    data.profile = req.profile;
    data.user = req.user;
    service(data)
        .then(response => {
            utils.jsonS(res, response, "Stats");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);

            //        })
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/borrower-stats";
vinfo.routeConfig.method = "get";
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware,
    has_role('admin'),
    routemeta('borrower-stats', 'none')
];
module.exports = vinfo;