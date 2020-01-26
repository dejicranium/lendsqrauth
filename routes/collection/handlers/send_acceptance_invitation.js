var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'collection/send_acceptance_invitation');
const profile_middleware = require('mlar')('profileVerifyMiddleware');

function vinfo(req, res, next) {
    const data = {
        ...req.body,
        ...req.query,
        ...req.headers,
        ...req.params
    };
    data.user = req.user
    data.profile = req.profile
    service(data)
        .then(response => {
            utils.jsonS(res, response, "Collection");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);

        })
}
vinfo.routeConfig = {};
vinfo.routeConfig.path = "/send-acceptance-iv";
vinfo.routeConfig.method = "post";
vinfo.routeConfig.middlewares = [
    routemeta('send_acceptance_invitation', 'none')
];
module.exports = vinfo;