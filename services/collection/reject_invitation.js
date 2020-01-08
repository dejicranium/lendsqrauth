const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const config = require('../../config');

/**  this is to be used by a borrower to reject a collections invitation 
 *  sent to him by a lender.
 * 
 * The Lenderr should be notified about the outcome
 *   
 */
var spec = morx.spec({})
    .build('token', 'required:true')
    .end();

function service(data) {
    const DECLINED_STATUS = 'Declined';
    var d = q.defer();
    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;



            return models.borrower_invites.findOne({
                where: {
                    token: params.token
                }
            })


        })
        .then(async (instance) => {

            if (!instance) throw new Error("Invalid token");
            if (instance.token_is_used) throw new Error("Token is already used");
            
            return [
                models.collection.findOne({
                    where: {
                        //id: auth_meta.collection_id
                        id: instance.collection_id
                    }
                }),

                instance
            ];
        })
        .spread(async (collection, instance) => {
            if (!collection) throw new Error("Could not find collection");

           // DELETE THE CREATED USER ACCOUNT AND PROFILE
            let borrower_profile = await models.profile.findOne({
                where: {
                    id: instance.profile_created_id
                }
            });

            let user = await models.user.findOne({
                where: {
                    id: borrower_profile.user_id
                }
            });
            await borrower_profile.update({deleted_flag:1});
            await user.update({deleted_flag:1});

            await instance.update({
                token_is_used: true,
                status: 'Declined',
                date_declined: new Date()
            });

            collection.status = DECLINED_STATUS;
            return collection.save();
        })
        .then((saved) => {
            if (!saved) throw new Error("Could not update collection");

            d.resolve("Rejected the invitation")
        })

        .catch((error) => {
            d.reject(error);

        })

    return d.promise;

}
service.morxspc = spec;
module.exports = service;