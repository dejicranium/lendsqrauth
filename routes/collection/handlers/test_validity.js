var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'collection/test_validity');

function vinfo(req, res, next){
    const data = {...req.body, ...req.query, ...req.headers, ...req.params};

    service(data)
        .then(response => {
            utils.jsonS(res, response, "VALIDITY-TEST");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
                                                
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/validate";
vinfo.routeConfig.method = "post";
vinfo.routeConfig.middlewares = [routemeta('test_collection_validity', 'none')];
module.exports = vinfo;

