var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/signin');
const routemeta = require('mlar')('routemeta');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};

        data.reqData = req; // for audit trail 
        service(data)
        .then(response => {
            utils.jsonS(res, response, "User signed in successfully"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                                    require('mlar')('locallogger').error(req, res.statusCode, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [routemeta('auth_signin', 'none')];
module.exports = vinfo;

