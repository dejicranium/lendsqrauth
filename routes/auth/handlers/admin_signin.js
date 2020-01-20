var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/admin_signin');
const routemeta = require('mlar')('routemeta');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.reqData = req;
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Admin user signed in successfully"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                        require('mlar')('locallogger').error(req, res.statusCode, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/admin/signin"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [routemeta('auth_admin_signin', 'none')];
module.exports = vinfo;

