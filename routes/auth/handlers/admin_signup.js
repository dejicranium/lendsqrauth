var utils = require('mlar')('mt1l');
const signupService = require('mlar').mreq('services', 'auth/admin_signup');
const routemeta = require('mlar')('routemeta');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        data.reqData = req;
        data.create_profile = true;
        signupService(data)
        .then(response => {
            utils.jsonS(res, null, "Admin Account created successfully"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/admin/signup"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [ routemeta('auth_admin_sign_up', 'none')];
module.exports = vinfo;

