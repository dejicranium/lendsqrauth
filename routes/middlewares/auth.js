const models = require('mlar')('models');
const jwt = require('jsonwebtoken');
const config = require('../../config');

module.exports = function (req, res, next) {
    let auth_token = req.headers.lendi_auth_token;
    
    jwt.verify(auth_token, config.JWTsecret)
        .then((decoded) => {
            if (!decoded) throw new Error("Unauthorized access attempted");

            models.auth_token.findOne({
                where: {
                    type: 'session',
                    token:  auth_token,
                },
                include: [{model: models.user}]
            }).then(found=> {
                if(!found) throw new error("Invalid access token")
                if(found.exipry <  new Date()) throw new error("Access token has expired")
                req.user = found.user
            }).catch(err=> {
                throw new Error(err)
            })

        }).catch(err=> {
            throw new Error(err)
        })
    next();
}
