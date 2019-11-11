var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/bankinfo.get');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const has_role = require('mlar')('hasRoleMiddleware');
/**
 * Used by admin to get info about user's bank account
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        
        data.ignore_default_user_id  = true; // do not default user_id to the user making the request;
        
        service(data)
        .then(response => {
            message = 'Bank details';
            utils.jsonS(res, response, message); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/admin/users/:user_id/bank"; 
vinfo.routeConfig.method = "get"; 
vinfo.routeConfig.middlewares = [
    auth_middleware,
    has_role('admin'),
    auth_middleware,
    routemeta('get_user_bank_info', 'none')
];
module.exports = vinfo;

