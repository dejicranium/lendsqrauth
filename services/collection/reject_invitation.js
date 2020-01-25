const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const config = require('../../config');
const send_email = require('mlar').mreq('notifs', 'send');


/**  this is to be used by a borrower to reject a collections invitation 
 *  sent to him by a lender.
 * 
 * The Lenderr should be notified about the outcome
 *   
 */
var spec = morx.spec({})
    .build('token', 'required:true')
    .build('feedback', 'required:false')

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

                instance,

                params
            ];
        })
        .spread(async (collection, instance, params) => {
            if (!collection) throw new Error("Could not find collection");
            let product = await models.collection_init_state.findOne({
                where: {
                    collection_id: collection.id
                }
            });

            product = JSON.parse(product.state);

            let lender = await models.profile.findOne({
                where: {
                    id: collection.lender_id
                },
                include: [{
                    model: models.user
                }]
            })

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
            await borrower_profile.update({
                deleted_flag: 1
            });
            await user.update({
                deleted_flag: 1
            });





            let feedback = '';





            if (params.feedback) {
                feedback = params.feedback.split('--');
                feedback = JSON.stringify(feedback)
            }

            await instance.update({
                feedback,
                token_is_used: true,
                status: 'Declined',
                date_declined: new Date(),
            });

            const LENDER_NOTIF = 149;
            const BORROWER_NOTIF = 150;

            let confirmation_email_payload = {
                lenderFullName: lender.user.first_name ? lender.user.first_name + ' ' + lender.user.last_name : lender.user.business_name,
                loanAmount: collection.amount,
                borrowerName: collection.borrower_first_name + ' ' + collection.borrower_last_name,
                borrowerFullName: collection.borrower_first_name + ' ' + collection.borrower_last_name,
                interestRate: product.interest + '%',
                interestPeriod: product.interest_period,
                rejectionFeedback: feedback ? feedback : '',
                collectionScheduleURL: config.base_url + 'collections',
                loanRepaymentScheduleURL: config.base_url + 'collections',
            };
            await send_email(LENDER_NOTIF, lender.user.email, confirmation_email_payload);
            await send_email(BORROWER_NOTIF, user.email, confirmation_email_payload);

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