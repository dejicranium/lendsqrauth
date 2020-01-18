var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'collection/complete_registration');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
    data.reqData = req;

    service(data)
        .then(response => {
            utils.jsonS(res, response, "Registration completed"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                                    require('mlar')('locallogger').error(req, res.statusCode, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/borrower-signup"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [routemeta('borrower-signup', 'none')];
module.exports = vinfo;

