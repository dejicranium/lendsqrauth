var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'collection/reject_invitation');

function vinfo(req, res, next) {
    const data = {
        ...req.body,
        ...req.query,
        ...req.headers,
        ...req.params
    };

    service(data)
        .then(response => {
            utils.jsonS(res, response, "Collection invitation rejected");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
                                                require('mlar')('locallogger').error(req, res.statusCode, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/invitations/reject";
vinfo.routeConfig.method = "post";
vinfo.routeConfig.middlewares = [routemeta('reject_collection_invitation', 'none')];
module.exports = vinfo;