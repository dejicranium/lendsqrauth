var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'collection/accept_invitation');

function vinfo(req, res, next) {
    const data = {
        ...req.body,
        ...req.query,
        ...req.headers,
        ...req.params
    };

    data.reqData = req;

    service(data)
        .then(response => {
            utils.jsonS(res, response, "Collection invitation accepted");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);                         
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/invitations/accept";
vinfo.routeConfig.method = "post";
vinfo.routeConfig.middlewares = [routemeta('accept_collection_invitation', 'none')];
module.exports = vinfo;