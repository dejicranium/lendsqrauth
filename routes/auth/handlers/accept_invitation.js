var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/accept_invitation');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const has_perm_middleware = require('mlar')('hasPermMiddleware');

function vinfo(req, res, next) {
    const data = {
        ...req.query,
        ...req.body,
        ...req.headers
    };
    data.reqData = req;
    service(data)
        .then(response => {
            utils.jsonS(res, response, "Process completed successfully");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/invites/accept";
vinfo.routeConfig.method = "put";
vinfo.routeConfig.middlewares = [
    routemeta('accept_invitation', 'none')
];


module.exports = vinfo;