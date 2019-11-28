const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger'); 
const morx = require('morx'); 
const q = require('q'); 
const validators = require('mlar')('validators'); 
const assert = require('mlar')('assertions'); 

/**  this is to be used by a borrower to reject a collections invitation 
 *  sent to him by a lender.
 * 
 * The Lenderr should be notified about the outcome
 *   
 */
var spec = morx.spec({}) 
			   .build('token', 'required:true' )  
			   
			              
			   .end();

function service(data){
    const DECLINED_STATUS = 'borrower_declined';
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
        if (!collection) throw new Error("Could not find collection");
        
        // check whether the borrower email is already a user
        let borrower = await models.user.findOne({where: {email: collection.borrower_email}})

        if (borrower.id) {
            d.resolve("USER");
        }

        d.resolve("NOT USER")
    
    })

    .catch( (error) => {
        d.reject(error);

    })

	return d.promise;

}
service.morxspc = spec;
module.exports = service;
