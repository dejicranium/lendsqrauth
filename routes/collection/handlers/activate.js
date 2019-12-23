var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const profile_middleware = require('mlar')('profileVerifyMiddleware');
const service = require('mlar').mreq('services', 'collection/activate');

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
            utils.jsonS(res, response, "Collection activated");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/:collection_id/activate";
vinfo.routeConfig.method = "put";
vinfo.routeConfig.middlewares = [auth_middleware, profile_middleware, routemeta('activate_collection', 'none')];
module.exports = vinfo;