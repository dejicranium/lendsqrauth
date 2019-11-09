const models = require('mlar')('models');
const jwt = require('jsonwebtoken');
const config = require('../../config');
var utils = require('mlar')('mt1l');
const q = require('q');

module.exports = async function (req, res, next) {
    let auth_token = req.headers.lendi_auth_token || req.headers.access_token;
    const d = q.defer();

    jwt.verify(auth_token, config.JWTsecret, function(err, decoded){

        if (err) utils.jsonF(res, null, "Unauthorized access attempted"); 
        if (decoded && decoded.expiry < new Date())  utils.jsonF(res, null, "Expired access token");
        models.auth_token.findOne({
            where: {
                type: 'session',
                token: auth_token,
            },
            include: [{model: models.user, include:[{model: models.profile}]}]
           
        }).then(resp=> {
            if (!resp) utils.jsonF(res, null, "Invalid access token");
            req.user = resp.user
            req.decoded = decoded
            next()
        })
        .catch(err=> {
             utils.jsonF(res, null, err);
        })

    })
    return d.promise
}
