const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const requests = require('mlar')('requests');
const config = require('../../config');

/**  this is to be used by a borrower to reject a collections invitation
 *  sent to him by a lender.
 *
 * The Lenderr should be notified about the outcome
 *
 */
var spec = morx.spec({})
    .build('collection_id', 'required:true')
    .end();

function service(data) {
    var d = q.defer();
    q.fcall(async () => {
        const validParameters = morx.validate(data, spec, {
            throw_error: true
        });
        const params = validParameters.params;

        let getCollection = models.collection.findOne({
            where: {id: params.collection_id, lender_id: data.profile.id},
            include: [{model: models.product}]
        });
        let getBorrowerInvites = models.borrower_invites.findOne({where: {collection_id: params.collection_id}});

        return [getCollection, getBorrowerInvites]

    })
    .spread(async (collection, invite) => {

            if (!collection) throw new Error("You have no such collection");
            if (!invite) throw new Error("Could not get associated invitation");
            if (collection.status !== 'inactive') throw new Error("You can send resend an invitation only if your collection is inactive");
            if (invite.status !== 'Pending') throw new Error("This invitation is not pending");

            if (collection.borrower_email){

                // get token from borrower invites;
                let invitation_token = invite.token;

                // prepare email
                let lender_name =
                    data.profile.business_name || data.user.first_name + ' ' + data.user.last_name;


                let email_payload = {
                    lenderFullName: lender_name,
                    loanAmount: collection.amount + ` NGN`,
                    interestRate: collection.product.interest+  " %",
                    interestPeriod: collection.product.interest_period,
                    tenor: collection.tenor + ' ' + collection.product.tenor_type,
                    borrowersFullName: collection.borrower_first_name + ' ' + collection.borrower_last_name,
                    accept_url: config.base_url + 'accept-borrower-invite',
                    reject_url: config.base_url + 'accept-borrower-invite',
                };
                try {
                    await requests.inviteBorrower(collection.borrower_email, email_payload);
                    d.resolve("Successfully re-invited borrower");
                }
                catch(e){
                    throw new Error(e);
                }
            }
            else {
                throw new Error("Collection has no borrower email");
            }

    }).catch(err => {
        d.reject(err);
    });


    return d.promise;

}
service.morxspc = spec;
module.exports = service;