const models = require('mlar')('models');
const jwt = require('jsonwebtoken');
var utils = require('mlar')('mt1l');
const q = require('q');


module.exports  = function(role) {

    let middleware = (req, res, next) => {
        let profile_role= req.profile ? req.profile.role : null
        
        if (typeof role == 'object') {
            if (role.includes(profile_role)) {
                next()
                return;
            }
        }
        if (role == profile_role){
            next();
            return
        }
        
        else
            utils.jsonF(res, null, `Profile not an ${role} type.`);
            return;
        
    }

    return middleware;

}