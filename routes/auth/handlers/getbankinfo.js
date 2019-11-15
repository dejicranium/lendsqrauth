var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/bankinfo.get');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.user_id = req.user.id;

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
vinfo.routeConfig.path = "/users/bank"; 
vinfo.routeConfig.method = "get"; 
vinfo.routeConfig.middlewares = [
    auth_middleware,
    routemeta('get_user_bank_info', 'none')
];
module.exports = vinfo;

