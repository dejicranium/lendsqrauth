var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'collection/get');
const profile_middleware = require('mlar')('profileVerifyMiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.user = req.user;
        data.profile = req.profile;
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Products"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                                                
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/:collection_id(\\d+)"; 
vinfo.routeConfig.method = "get"; 
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_middleware, 
    routemeta('get_collection', 'none')];
module.exports = vinfo;

