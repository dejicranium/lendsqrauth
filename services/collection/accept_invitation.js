const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const AuditLog = require('mlar')('audit_log');

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
    const ACCEPTED_STATUS = 'Accepted';
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

            if (!instance) throw new Error("Invalid token")

            // if token exists, go ahead and grab the collection id
            /*
            let auth_meta = JSON.parse(instance.meta);
            if (!auth_meta.collection_id) throw new Error("No collection is linked to this token")
            */
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

            await instance.update({
                token_is_used: true,
                status: ACCEPTED_STATUS,
                date_accepted: new Date()
            });
            // update collection;

            collection.status = 'active';

            return collection.save();
        })
        .then(async (saved) => {
            if (!saved) throw new Error("Could not update collection");

            // audit

            let audit = new AuditLog(data.reqData, 'CREATE', `accepted invitation from user. Borrower Id: ${saved.borrower_id}`)
            await audit.create();
            d.resolve("Accepted the invitation")

        })

        .catch((error) => {
            d.reject(error);

        })

    return d.promise;

}
service.morxspc = spec;
module.exports = service;