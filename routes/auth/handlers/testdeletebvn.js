var utils = require('mlar')('mt1l');
const signupService = require('mlar').mreq('services', 'auth/test_delete_bvn');
const routemeta = require('mlar')('routemeta');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        
        signupService(data)
        .then(response => {
            utils.jsonS(res, null, "BVN deleted"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                                    require('mlar')('locallogger').error(req, res.statusCode, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/test/bvn-delete"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [ routemeta('auth_bvn_delete', 'none')];
module.exports = vinfo;

