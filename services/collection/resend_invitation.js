const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const requests = require('mlar')('requests');
const config = require('../../config');
const AuditLog = require('mlar')('audit_log');

/**  this is to be used by a borrower to reject a collections invite
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
                where: {
                    id: params.collection_id,
                    lender_id: data.profile.id
                },
                include: [{
                    model: models.product
                }]
            });
            let getBorrowerInvites = models.borrower_invites.findOne({
                where: {
                    collection_id: params.collection_id
                }
            });

            return [getCollection, getBorrowerInvites]

        })
        .spread(async (collection, invite) => {

            if (!collection) throw new Error("You have no such collection");
            if (!invite) throw new Error("Could not get associated invite");
            //if (invite.status.toLowerCase() === 'accepted') throw new Error("This invite has already been accepted");

            //if (collection.status !== 'inactive') throw new Error("You can send resend an invite only if your collection is inactive");

            if (collection.borrower_email) {

                // get token from borrower invites;
                let invite_token = invite.token;

                // prepare email
                let lender_name =
                    data.profile.business_name || data.user.first_name + ' ' + data.user.last_name;


                let borrower = await models.profile.findOne({
                    where: {
                        id: collection.borrower_id
                    }
                });

                if (borrower.status == 'blacklisted') throw new Error("Borrower's profile has been deactivated");

                let email_payload = {
                    lenderFullName: lender_name,
                    loanAmount: collection.product.amount + ` NGN`,
                    interestRate: collection.product.interest + " %",
                    interestPeriod: collection.product.interest_period,
                    tenor: collection.tenor + ' ' + collection.product.tenor_type,
                    borrowersFullName: collection.borrower_first_name + ' ' + collection.borrower_last_name,
                    rejectURL: config.base_url + 'signup/borrower/reject?token=',
                    acceptURL: config.base_url + 'signup/borrower/accept?token=',
                    collectionURL: config.base_url + 'collections'
                };

                let borrower_is_new_user = !borrower.user || !borrower.user.password;

                if (borrower_is_new_user) {
                    email_payload.acceptURL = config.base_url + 'signup/borrower?token=' + invite.token;
                } else {
                    email_payload.acceptURL += invite.token;
                }
                email_payload.rejectURL += invite.token;

                try {
                    await requests.inviteBorrower(collection.borrower_email, email_payload);

                    let audit = new AuditLog(data.reqData, "CREATE", "re-sent borrower invite");
                    await audit.create();

                    d.resolve("Successfully re-invited borrower");
                } catch (e) {
                    throw new Error(e);
                }
            } else {
                throw new Error("Collection has no borrower email");
            }

        }).catch(err => {
            d.reject(err);
        });


    return d.promise;

}
service.morxspc = spec;
module.exports = service;