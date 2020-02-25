var utils = require('mlar')('mt1l');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const service = require('mlar').mreq('services', 'collection/mark_schedule');

function vinfo(req, res, next){ 
        const data = {...req.body, ...req.query, ...req.headers, ...req.params};
        
        service(data)
        .then(response => {
            utils.jsonS(res, response, "Marked schedule"); 
        })
        .catch(error => {
            utils.jsonF(res, null, error.message); 
                                                
        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/:collection_id/schedules/:schedule_id"; 
vinfo.routeConfig.method = "post"; 
vinfo.routeConfig.middlewares = [auth_middleware, routemeta('mark_schedule', 'none')];
module.exports = vinfo;

