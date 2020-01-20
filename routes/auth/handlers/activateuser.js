var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/checktoken');
const routemeta = require('mlar')('routemeta');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.reqData = req;
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Update was successful"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                        require('mlar')('locallogger').error(req, res.statusCode, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/users/activate"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [
    routemeta('auth_activate_user', 'none')
];
module.exports = vinfo;

