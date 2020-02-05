var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'collection/confirm_collection_creation');

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
            utils.jsonS(res, response, "Collection confirmed");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/confirm-creation";
vinfo.routeConfig.method = "post";
vinfo.routeConfig.middlewares = [routemeta('collection-confirm', 'none')];
module.exports = vinfo;