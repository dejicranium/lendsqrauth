// var utils = require('mlar')('mt1l');
// const service = require('mlar').mreq('services', 'auth/veriflite');
// const routemeta = require('mlar')('routemeta');
// function vinfo(req, res, next){ 
//         const service_data = {...req.body, ...req.query, ...req.headers};
//         req._$vnbreqid = service_data.requestId;
//         service(service_data, {
//             hash_fields: req.hash_fields,
//             enforce_hash_check: req.enforce_hash_check
//         })
//         .then( service_response => {
//             ////console.log(service_response);
//             //req.user = service_response;
//             next(); 
//         })
//         .catch( service_error => {
// 			////console.log(service_error);
//             utils.jsonF(res, null, service_error.message); 
//         })
// }
// module.exports = vinfo;
module.exports = {};



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
