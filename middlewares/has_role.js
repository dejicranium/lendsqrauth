const models = require('mlar')('models');
const jwt = require('jsonwebtoken');
var utils = require('mlar')('mt1l');
const q = require('q');


module.exports  = function(role) {

    let middleware = (req, res, next) => {
        let role_id = req.headers['r_id'] || 0
        let profile_id = req.headers['p_id'] || 0

        // certify that user owns the profile
        models.profile.findOne({
            where: {
                id: profile_id,
                user_id: req.user.id,
            },
            include: [
                {model: models.role}
            ]
        }).then(prof=> {
            if (!prof)  utils.jsonF(res, null, "Profile entered does not match user records");
            else if (prof.role_id  != role_id) utils.jsonF(res, null, "Profile entered does not match user records");
            // if user does not have role
            else if (prof.role !== undefined) {
                if (prof.role.name !== role) {
                    utils.jsonF(res, null, "User role cannot perform this action");                
                } 
                else {
                    next();
                }
            }
            else if (prof.roles !== undefined) {
                if (prof.roles[0].name !== role) {
                    utils.jsonF(res, null, "User role cannot perform this action");                
                } 
                else {
                    next();
                }
            }
           
        }).catch(error=> {
            utils.jsonF(res, null, "Profile entered does not match user records");
        })

        
    }
    return middleware;

}