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

            if (!instance) throw new Error("Invalid token");
            if (instance.token_is_used) throw new Error("Token is already used");

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
                    },

                }),

                instance
            ];
        })
        .spread(async (collection, instance) => {
            if (!collection) throw new Error("Could not find collection");

            await instance.update({
                token_is_used: true,
                status: ACCEPTED_STATUS,
                date_accepted: new Date(),
                date_joined: new Date()
            });
            // update collection;
            collection.status = 'active';
            return collection.save();
        })
        .then(async (collection) => {
            if (!collection) throw new Error("Could not update collection");


            let borrower = await models.profile.findOne({
                where: {
                    id: collection.borrower_id
                }
            });

            let borrower_userId = null;
            if (borrower && borrower.user_id) {
                borrower_userId = borrower.user_id;
            }

            let lender = await models.profile.findOne({
                where: {
                    id: collection.lender_id
                },
                include: [{
                    model: models.user
                }]
            });


            let product = await models.product.findOne({where: {id: collection.product_id}});
            let params = {
                amount: collection.amount,
                tenor: collection.tenor,
                tenor_type: product.tenor_type,
                num_of_collections: collection.num_of_collections,
                interest: product.interest,
                interest_period: product.interest_period,
                start_date: collection.start_date,
                collection_frequency: collection.collection_frequency,
                repayment_model: product.repayment_model
            };

            // first, send email notification to the lender;
            const LENDER_COLLECTION_CONFIRMATION_EMAIL_CONTEXT_ID = 104;
            const BORROWER_COLLECTION_CONFIRMATION_EMAIL_CONTEXT_ID = 103;

            let confirmation_email_payload = {
                lenderFullName: lender.user.first_name ? lender.user.first_name + ' ' + lender.user.last_name : lender.user.business_name,
                loanAmount: collection.amount,
                borrowerName:collection.borrower_first_name + ' ' + collection.borrower_last_name,
                interestRate: product.interest + '%',
                interestPeriod: product.interest_period,
                tenor: collection.tenor + ' ' + product.tenor_type,
                link: config.base_url + 'collections',
                loanRepaymentURL: '',  //TODO: makee sure that this links to reapyment schedule url
            };
            // SEND!
            send_email(LENDER_COLLECTION_CONFIRMATION_EMAIL_CONTEXT_ID, confirmation_email_payload);
            send_email(BORROWER_COLLECTION_CONFIRMATION_EMAIL_CONTEXT_ID, confirmation_email_payload);


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
                                borrower_userId: borrower_userId,
                                borrower_id: collection.borrower_id,
                                lender_id: collection.lender_id,
                                status: 'Pending',
                            };
                            bulkdata.push(period);

                        }
                    });
                    await models.collection_schedules.bulkCreate(bulkdata);
                    //console.log(resp);
                })
                .catch(err => {
                    //silent failure
                    //console.log(err)
                })




            // audit

            let audit = new AuditLog(data.reqData, 'CREATE', `accepted invitation from user. Borrower Id: ${collection.borrower_id}`)
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