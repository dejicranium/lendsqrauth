process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


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


            let product = await models.collection_init_state.findOne({
                where: {
                    collection_id: collection.id
                }
            })
            product = JSON.parse(product.state);

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


            let params = {
                amount: collection.amount,
                tenor: collection.tenor,
                tenor_type: product.tenor_type,
                num_of_collections: collection.num_of_collections,
                interest: product.interest,
                interest_period: product.interest_period,
                start_date: collection.start_date,
                collection_frequency: collection.collection_frequency,
                repayment_model: product.repayment_model,
            };

            let result = await requests.createCollectionSchedule(params)
                .then(async resp => {
                    let bulkdata = [];
                    resp.periods.forEach(async r => {


                        if (resp.periods.indexOf(r) !== 0) {
                            /*
                            let borrower_userId = await models.profile.findOne({
                                where: {
                                    id: collection.borrower_id
                                }
                            });*/

                            let period = {
                                period_id: r.period,
                                from_date: r.fromDate.join('-'),
                                due_date: r.dueDate.join('-'),
                                days_in_period: r.daysInPeriod,
                                principal_due: r.principalDue,
                                interest_due: r.interestDue,
                                fee: r.feeChargesDue,
                                total_amount: r.totalDueForPeriod,
                                loan_id: product.id,
                                balance_outstanding: r.principalLoanBalanceOutstanding,
                                interest_outstanding: r.interestOutstanding,
                                collection_id: collection.id,
                                lender_userId: lender.user.id,
                                borrower_userId: borrower.user.id,
                                borrower_id: collection.borrower_id,
                                lender_id: collection.lender_id,
                                status: 'Pending',
                            };
                            bulkdata.push(period);

                        }
                    });
                    await models.collection_schedules.bulkCreate(bulkdata);
                    console.log(resp);
                })
                .catch(err => {
                    //silent failure
                    console.log(err)
                })


            d.resolve("Accepted the invitation")

        })

        .catch((error) => {
            d.reject(error);

        })

    return d.promise;

}
service.morxspc = spec;
module.exports = service;