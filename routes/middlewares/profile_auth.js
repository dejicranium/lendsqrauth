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
            if (decoded && decoded.expiry < new Date()) utils.jsonF(res, 'null', "Expired access token");

            if (err) {
                utils.jsonF(res, null, "Profile token expired or invalid");
                return;
            }
            try {
                console.log('attempting to start jwt decode')
                let decoded_auth_token = jwt_decode(auth_token)
                console.log('auth token is ' + auth_token)

                let user_profiles = decoded_auth_token.profiles;
                console.log('user profiles  is ' + Object.keys(user_profiles))

                let decoded_dict = jwt_decode(prof_token);
                console.log('decoded token is ' + decoded_dict);


                if (decoded_dict) {
                    req.profile = decoded_dict;

                    console.log('profile id is ' + req.profile.id)

                    // check to make sure that the profile is among the logged in user's profiles 

                    if (!user_profiles.includes(req.profile.id)) {
                        console.log('attempting to get req profile.id')

                        utils.jsonF(res, '334', "User-Profile mismatch");
                        return;
                    } else {
                        console.log('got req profile.id');
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