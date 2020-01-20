var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/bankinfo.delete');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const has_role = require('mlar')('hasRoleMiddleware');
const profile_verify = require('mlar')('profileVerifyMiddleware');


/**
 * Used by admin to get info of bank
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function vinfo(req, res, next) {
    const data = {
        ...req.body,
        ...req.query,
        ...req.headers,
        ...req.params
    };
    data.user = req.user;
    data.profile = req.profile;
    data.reqData = req;


    data.user_id = req.user.id // default user_id to the user making the request;
    service(data)
        .then(response => {
            utils.jsonS(res, response, "Deletion successful");
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
                                    require('mlar')('locallogger').error(req, res.statusCode, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/users/bank/:id";
vinfo.routeConfig.method = "delete";
vinfo.routeConfig.middlewares = [
    auth_middleware,
    profile_verify,
    routemeta('update_user_bank_info', 'none')
];
module.exports = vinfo;