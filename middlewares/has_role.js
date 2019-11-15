const models = require('mlar')('models');
const jwt = require('jsonwebtoken');
var utils = require('mlar')('mt1l');
const q = require('q');


module.exports  = function(role) {

    let middleware = (req, res, next) => {
        
        let profile_role= req.profile ? req.profile.role : null

        if (role == profile_role)
            next();
                
        
        else
            utils.jsonF(res, null, `Profile not an ${role} type.`);

        
    }

    return middleware;

}