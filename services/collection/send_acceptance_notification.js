const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const AuditLog = require('mlar')('audit_log');
const requests = require('mlar')('requests');
const send_email = require('mlar').mreq('notifs', 'send');
const config = require('../../config');
const initState = require('../../utils/init_state')

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

            return [
                models.collection.findOne({
                    where: {
                        id: params.collection_id
                    }
                }),

                models.borrower_invites.findOne({
                    where: {
                        collection_id: params.collection_id
                    }
                })
            ]
        })
        .spread(async (collection, invite) => {
            if (!collection) throw new Error("Could not find collection");

            // update invite to accepted.
            invite.status = "Accepted"
            invite.token_is_used = true;

            collection.status = 'active';
            await collection.save();
            await invite.save();


            let product = await initState.getInitState('collections', collection.id);

            let lender = await models.profile.findOne({
                where: {
                    id: collection.lender_id
                },
                include: [{
                    model: models.user
                }]
            })

            let borrower = await models.profile.findOne({
                where: {
                    id: collection.borrower_id
                },
                include: [{
                    model: models.user
                }]
            })

            // first, send email notification to the lender;
            const LENDER_COLLECTION_CONFIRMATION_EMAIL_CONTEXT_ID = 104;
            const BORROWER_COLLECTION_CONFIRMATION_EMAIL_CONTEXT_ID = 103;

            let confirmation_email_payload = {
                lenderFullName: lender.user.first_name ? lender.user.first_name + ' ' + lender.user.last_name : lender.user.business_name,
                loanAmount: collection.amount,
                borrowerName: collection.borrower_first_name + ' ' + collection.borrower_last_name,
                interestRate: product.interest + '%',
                interestPeriod: product.interest_period,
                tenor: collection.tenor + ' ' + product.tenor_type,
                link: config.base_url + 'collections',
                collectionScheduleURL: config.base_url + 'collections', //TODO: makee sure that this links to reapyment schedule url
                loanRepaymentURL: config.base_url + 'collections',
            };
            // SEND!
            send_email(LENDER_COLLECTION_CONFIRMATION_EMAIL_CONTEXT_ID, lender.user.email, confirmation_email_payload);
            send_email(BORROWER_COLLECTION_CONFIRMATION_EMAIL_CONTEXT_ID, collection.borrower_email, confirmation_email_payload);

            d.resolve("Accepted the invitation")

        })

        .catch((error) => {
            d.reject(error);

        })

    return d.promise;

}
service.morxspc = spec;
module.exports = service;