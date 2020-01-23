var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'product/enable_disable');
const profile_middleware = require('mlar')('profileVerifyMiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.profile = req.profile;
        data.user = req.user;
        data.reqData = req;
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
vinfo.routeConfig.middlewares = [
    auth_middleware, 
    profile_middleware,
    routemeta('enable_disable', 'none')];
module.exports = vinfo;

