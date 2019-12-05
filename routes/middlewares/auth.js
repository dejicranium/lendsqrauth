const models = require('mlar')('models');
const jwt = require('jsonwebtoken');
const config = require('../../config');
var utils = require('mlar')('mt1l');
const q = require('q');

module.exports = async function (req, res, next) {
    let auth_token = null;
    let authorization_header = req.headers.authorization;

    if (authorization_header) {
        auth_token = authorization_header.split(' ')[1];
    }
    
    const d = q.defer();
    if (!auth_token) {
        utils.jsonF(res, null, "Access token required"); 
        return;
    }
    jwt.verify(auth_token, config.JWTsecret, function(err, decoded){

        if (err) utils.json401(res, null, "Invalid access token"); 
        if (decoded && decoded.expiry < new Date())  utils.json401(res, null, "Expired access token");
        models.auth_token.findOne({
            where: {
                type: 'session',
                token: auth_token,
            },
            include: [{model: models.user, include:[{model: models.profile}]}]
           
        }).then(resp=> {
            if (!resp) utils.json401(res, null, "Invalid access token");
            req.user = resp.user
            req.auth_token = auth_token;
            req.decoded = decoded
            next()
            return
        })
        .catch(err=> {
             utils.json401(res, null, err);
             return;
        })

    })
    return d.promise
}
