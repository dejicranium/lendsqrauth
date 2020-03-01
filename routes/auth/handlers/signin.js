var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/signin');
const routemeta = require('mlar')('routemeta');
const AccountBlacklisted = require('../../../utils/errors/account-blacklisted');


function vinfo(req, res, next) {
    const data = {
        ...req.body,
        ...req.query,
        ...req.headers,
        ...req.params
    };

    data.reqData = req; // for audit trail 
    service(data)
        .then(response => {
            utils.jsonS(res, response, "User signed in successfully");
        })
        .catch(error => {
            if (error instanceof AccountBlacklisted) {
                utils.json403(res, {}, error.message);
            } else {
                utils.jsonF(res, null, error.message);
            }
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/";
vinfo.routeConfig.method = "post";
vinfo.routeConfig.middlewares = [routemeta('auth_signin', 'none')];
module.exports = vinfo;