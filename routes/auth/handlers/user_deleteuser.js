var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/delete');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.user_id = req.user.id;
        data.user = req.user;
        data.reqData = req;
        service(data)
        .then(response => {
            utils.jsonS(res, response, "User has been deleted successfully"); 
                                    
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/users"; 
vinfo.routeConfig.method = "delete"; 
vinfo.routeConfig.middlewares = [
    auth_middleware, routemeta('auth_delete_user', 'none')];
module.exports = vinfo;

