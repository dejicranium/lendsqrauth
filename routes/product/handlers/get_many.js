var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'product/get');
const profile_middleware = require('mlar')('profileVerifyMiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
<<<<<<< HEAD
        data.fetch_all = true;
=======
        data.profile = req.profile;
>>>>>>> cc26c9353086ac1372969cb67289c892945cc6d0
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Products"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/"; 
vinfo.routeConfig.method = "get"; 
vinfo.routeConfig.middlewares = [
    auth_middleware, 
    profile_middleware,
    routemeta('get_products', 'none')];
module.exports = vinfo;

