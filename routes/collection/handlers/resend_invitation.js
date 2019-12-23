var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'collection/resend_invitation');
const profile_middleware = require('mlar')('profileVerifyMiddleware');

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
            utils.jsonS(res, response, "Collection invitation resent");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/:collection_id/invitations/resend";
vinfo.routeConfig.method = "post";
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware,
    routemeta('resend_collection_invitation', 'none')];
module.exports = vinfo;