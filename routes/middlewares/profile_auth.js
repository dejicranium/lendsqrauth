const models = require('mlar')('models');
const jwt = require('jsonwebtoken');
const config = require('../../config');
var utils = require('mlar')('mt1l');
const q = require('q');
const jwt_decode = require('jwt-decode');

module.exports = async function (req, res, next) {
    let prof_token = req.headers.profile_token
    const d = q.defer();

    try {
        prof_token.toString();
    }
    catch(err) {
        utils.jsonF(res, null, "Profile token not supplied");
    }
    
    jwt.verify(prof_token, config.JWTsecret, function(err, decoded){
        if (decoded && decoded.expiry < new Date())  utils.jsonF(res, null, "Expired access token");

        if (err) utils.jsonF(res, null, "Profile token expired or invalid"); 
        try {
            let decoded_dict = jwt_decode(prof_token);
            if (decoded_dict) {
                req.profile = decoded_dict
                next()
    
            }
        }
        catch(err) {
            utils.jsonF(res, null, err);  
            
        }
        
        /*models.auth_token.findOne({
            where: {
                type: 'session',
                token: prof_token,
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
        */
    })
    return d.promise
}
