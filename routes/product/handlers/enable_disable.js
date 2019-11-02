var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'product/enable_disable');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Product status changed"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
    })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/:product_id/status"; 
vinfo.routeConfig.method = "put"; 
vinfo.routeConfig.middlewares = [auth_middleware, routemeta('enable_disable', 'none')];
module.exports = vinfo;

