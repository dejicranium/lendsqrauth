const models = require('mlar')('models');
const jwt = require('jsonwebtoken');
var utils = require('mlar')('mt1l');
const q = require('q');


module.exports  = function(permission) {

    let middleware = (req, res, next) => {
        let role_id = req.headers['r_id'] || 0
        let profile_id = req.headers['p_id'] || 0

        // certify that user owns the profile
        models.profile.findOne({
            where: {
                id: profile_id,
                user_id: req.user.id,
            }
        }).then(prof=> {
            if (!prof)  utils.jsonF(res, null, "Profile entered does not match user records");
            else if (prof.role_id  != role_id) utils.jsonF(res, null, "Profile entered does not match user records");
            else {
                next();
            }
        }).catch(error=> {
            utils.jsonF(res, null, "Profile entered does not match user records");
        })


        
        models.sequelize.query(`
            SELECT p.name as name from entity_permissions as ep INNER JOIN permissions as p ON p.id = ep.permission_id WHERE p.name = '${permission}' AND ( (ep.entity = 'role' AND ep.entity_id = ${role_id} ) OR (ep.entity = 'profile' AND ep.entity_id = ${profile_id}) )`
        )
        .then(permissionNameQuery=> {
            let name = null; 
            if (permissionNameQuery && permissionNameQuery[0] && permissionNameQuery[0][0]){
                name = permissionNameQuery[0][0].name;
            }

            if (name) {
                next();
            }
            else {
                utils.jsonF(res, null, "User not authorized");
            }
        })
        .catch(error=> {
            utils.jsonF(res, null, error);

        }) 

        
    }
    return middleware;

}