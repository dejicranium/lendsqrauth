const logger = require('mlar')('logger');
module.exports = function (routename, routescopelevel, hash_fields, enforce_hash_check) {
    return (req, res, next) => {
        // default bank id. Set to different values accross all instances deployed
        req.body.bankId = process.env.BANK_ID || 1; 
        // routename is used to audit a route for permissions
        req.routename = routename;
        // routescopelevel is used to determine whether a dev's api key is required for auth or bank user's secret
        // possible values: dev | user
        req.routescopelevel = routescopelevel;
        req.hash_fields = hash_fields;
        req.enforce_hash_check = enforce_hash_check;

        if(req.headers.requestid){
            req.body.requestId = req.headers.requestid;
        }

        logger([routename, routescopelevel, hash_fields]);
        next();
    }
}