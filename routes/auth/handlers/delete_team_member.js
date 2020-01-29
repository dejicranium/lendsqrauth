var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/inviteuser');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const has_perm_middleware = require('mlar')('hasPermMiddleware');
const profile_middleware = require('mlar')('profileVerifyMiddleware');
const has_role = require('mlar')('hasRoleMiddleware');

function vinfo(req, res, next) {
    const data = {
        ...req.body,
        ...req.header,
        ...req.params,
        ...req.query
    };
    data.profile = req.profile;
    data.user = req.user;
    data.reqData = req;
    service(data)
        .then(response => {
            utils.jsonS(res, response, "Deleted");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/team/member/:profile_id";
vinfo.routeConfig.method = "delete";
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware,
    has_role(['individual_lender', 'business_lender']),
    routemeta('delete_team_member', 'none')
];
module.exports = vinfo;