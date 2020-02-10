const models = require('mlar')('models');
const jwt = require('jsonwebtoken');
const config = require('../../config');
var utils = require('mlar')('mt1l');
const q = require('q');
const jwt_decode = require('jwt-decode');

module.exports = async function (req, res, next) {
    let prof_token = req.headers.profile_token
    let auth_token = req.auth_token;

    const d = q.defer();

    try {
        prof_token.toString();
    } catch (err) {
        utils.jsonF(res, null, "Profile token not supplied");
        return;
    }

    jwt.verify(prof_token, config.JWTsecret, function (err, decoded) {
        if (decoded && decoded.expiry < new Date()) {
            utils.jsonF(res, 'null', "Expired access token");
            return 0;
        }

        if (err) {
            utils.jsonF(res, null, "Profile token expired or invalid");
            return;
        }
        try {
            let decoded_auth_token = jwt_decode(auth_token)

            let user_profiles = decoded_auth_token.profiles;

            let decoded_dict = jwt_decode(prof_token);


            if (decoded_dict) {
                req.profile = decoded_dict;


                // check to make sure that the profile is among the logged in user's profiles 

                if (!user_profiles.includes(req.profile.id)) {

                    utils.jsonF(res, '334', "User-Profile mismatch");
                    return;
                } else {
                    // else  go on
                    next();
                    return;
                }
            }
        } catch (err) {
            utils.jsonF(res, null, err);
            return;
        }

    });

    return d.promise
};