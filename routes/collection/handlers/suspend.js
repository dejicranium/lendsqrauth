var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'collection/suspend');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Collection suspended"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
    })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/:collection_id/suspend"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [auth_middleware, routemeta('suspend_collection', 'none')];
module.exports = vinfo;

