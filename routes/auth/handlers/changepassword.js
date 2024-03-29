var utils = require('mlar')('mt1l');
const forgotpassword = require('mlar').mreq('services', 'auth/changepassword');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};

        data.user = req.user;
        data.USER_ID = req.user.id;
        data.reqData = req;

        forgotpassword(data)
        .then(response => {
            utils.jsonS(res, response, "Password change successful");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                                    
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/password/change"; 
vinfo.routeConfig.method = "put"; 
vinfo.routeConfig.middlewares = [auth_middleware, routemeta('auth_forgot_password', 'none')];
module.exports = vinfo;

