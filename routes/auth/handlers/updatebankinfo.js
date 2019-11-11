var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/bankinfo.update');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const has_role = require('mlar')('hasRoleMiddleware');
/**
 * Used by admin to get info of bank
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        
        data.user_id = req.user.id // default user_id to the user making the request;
        
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Update successful"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/users/:user_id/bank"; 
vinfo.routeConfig.method = "put"; 
vinfo.routeConfig.middlewares = [
    auth_middleware,
    auth_middleware,
    routemeta('update_user_bank_info', 'none')
];
module.exports = vinfo;

