const models = require('mlar')('models');
const jwt = require('jsonwebtoken');
var utils = require('mlar')('mt1l');
const q = require('q');


module.exports  = function(role) {

    let middleware = (req, res, next) => {
        let profile_role= req.profile ? req.profile.role : null
        
        if (typeof role == 'object') {
            if (role.includes(profile_role)) {
                utils.jsonF(res, null, `${profile_role} profile doesn't have access to this resource`);
                
                next()
                return;
            }
        }
        if (role == profile_role){
            utils.jsonF(res, null, `${profile_role} profile doesn't have access to this resource`);
            return
        }
        
        else {
            next();
            return;

        }
        
    }

    return middleware;

}