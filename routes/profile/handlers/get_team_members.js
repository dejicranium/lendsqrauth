var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'profile/get_team_members');
const profile_middleware = require('mlar')('profileVerifyMiddleware');
const has_role = require('mlar')('hasRoleMiddleware');

function vinfo(req, res, next) {
    const data = {
        ...req.body,
        ...req.query,
        ...req.headers,
        ...req.params
    };

    // pass profile 
    data.user = req.user;
    data.profile = req.profile;
    service(data)
        .then(response => {
            utils.jsonS(res, response, "Profile");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
                                                require('mlar')('locallogger').error(req, res.statusCode, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/team";
vinfo.routeConfig.method = "get";
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware,
    has_role(['business_lender', 'individual_lender']),
    routemeta('get_team_members', 'none')
];
module.exports = vinfo;