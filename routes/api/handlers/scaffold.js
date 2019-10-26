var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'scaffold/test');
const routemeta = require('mlar')('routemeta');
function vinfo(req, res, next){ 
        const service_data = {...req.body, ...req.query, ...req.headers, ...req.params};
        service(service_data)
        .then( service_response => {
            utils.jsonS(res, service_response, "The process was completed successully"); 
        })
        .catch( service_error => {
            utils.jsonF(res, {code: service_error.code}, service_error.message); 
        })
}

vinfo.routeConfig = [{}];
vinfo.routeConfig[0].path = "/api/scaffold"; 
vinfo.routeConfig[0].method = "get"; 
vinfo.routeConfig[0].middlewares = [routemeta('vnuban_lookup', 'dev', ['requestId'])];
module.exports = vinfo;



/*
== MULTI METHOD / CONFIG ==
vinfo.routeConfig = [{}, {}];
vinfo.routeConfig[0].path = "/v12"; 
vinfo.routeConfig[0].method = "post"; 
vinfo.routeConfig[0].middlewares = ['v1'];
vinfo.routeConfig[1].path = "/v12"; 
vinfo.routeConfig[1].method = "get"; 
vinfo.routeConfig[1].middlewares = [];
*/
