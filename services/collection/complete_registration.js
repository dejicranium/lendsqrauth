const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 
const signup = require('mlar')('signupservice'); 

/**  this is to be used by a borrower to reject a collections invitation 
 *  sent to him by a lender.
 * 
 * The Lenderr should be notified about the outcome
 *   
 */
var spec = morx.spec({}) 
			.build('token', 'required:true' )  
		   .build('first_name', 'required:true' )  
		   .build('last_name', 'required:true' )  
		   .build('password', 'required:true' )  
			.build('password_confirmation', 'required:true' )  
			.build('email', 'required:true' )  
			.build('phone', 'required:true' )  
			.end();


// TODO: make type borrower
// TODO: 
function service(data){
	var d = q.defer();
	const globalUserId = data.USER_ID || 1;
	q.fcall( async () => {
		const validParameters = morx.validate(data, spec, {throw_error : true});
		const params = validParameters.params;
        return models.auth_token.findOne({
            where: {
                token: params.token,
                type: 'borrower_invitation',
            }
        })
	}) 
	.then(async (instance) => { 

        if (!instance) throw new Error("Invalid token")
        
        if (instance.is_used) throw new Error("Token has already been used");
        let auth_meta = JSON.parse(instance.meta);
        if (!auth_meta.collection_id) throw new Error("No collection is linked to this token")

        return [models.collection.findOne({where: {id: auth_meta.collection_id}}), instance];
    })
    .spread( async (collection, instance) => {
        if (!collection) throw new Error("Could not find collection associated with this invitation");
        
        // signup needs a type
        data.create_profile = false;
        data.type = "borrower";
        return [signup(data), collection, instance]
        
        
    })
    .spread( async  (signup_info, collection, instance) => {
        if (!signup_info) throw new Error("There was an error with the signup");
        
        if (signup_info.id) {
            // create a borrower profile for the user
            let borrower_role = await models.role.findOne({where: {name: 'borrower'}})
            
            let new_borrower_profile = await models.profile.create({
                user_id: signup_info.id,
                role_id: borrower_role.id,
                parent_profile_id: collection.profile_id
            })

            // update the collection 
            collection.update({
                status:'active',
                borrower_id: new_borrower_profile.id
            })

            // invalidate token 
            await instance.update({is_used: true})
            
        }

        d.resolve(signup_info)
    }) 
    .catch( (error) => {
        d.reject(error);

    })

	return d.promise;
}
service.morxspc = spec;
module.exports = service;
