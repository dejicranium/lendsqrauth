var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'profile/update_team_member');
const profile_middleware = require('mlar')('profileVerifyMiddleware');
const has_role = require('mlar')('hasRoleMiddleware');

function vinfo(req, res, next) {
    const data = {
        ...req.body,
        ...req.query,
        ...req.headers,
        ...req.params
    };

    data.user = req.user;
    data.profile = req.profile;
    data.reqData = req;

    service(data)
        .then(response => {
            utils.jsonS(res, response, "Profile updated");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
                                                
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/team/members/:profile_id";
vinfo.routeConfig.method = "put";
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware,
    has_role(['individual_lender', 'business_lender']),
    routemeta('profile_update', 'none')
];
module.exports = vinfo;