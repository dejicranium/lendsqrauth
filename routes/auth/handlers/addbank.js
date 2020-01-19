var utils = require('mlar')('mt1l');
const service = require('mlar').mreq('services', 'auth/bankinfo.add');
const routemeta = require('mlar')('routemeta');
const auth_middleware = require('mlar')('authmiddleware');
const has_role = require('mlar')('hasRoleMiddleware');

function vinfo(req, res, next) {
    const data = {
        ...req.body,
        ...req.query,
        ...req.headers,
        ...req.params
    };
    data.user_id = req.user.id;
    data.user = req.user;
    data.reqData = req;
    service(data)
        .then(response => {
            const message = response === 'OTP verified' ? 'OTP correct and account details stored' : "BVN verified and OTP sent to user's phone";
            utils.jsonS(res, response, message);
        })
        .catch(error => {
            utils.jsonF(res, null, error.message);
            require('mlar')('locallogger').error(req, res.statusCode, error.message);

        })
}

vinfo.routeConfig = {};
vinfo.routeConfig.path = "/users/bank";
vinfo.routeConfig.method = "post";
vinfo.routeConfig.middlewares = [
    auth_middleware,
    routemeta('add_user_bank', 'none')
];
module.exports = vinfo;