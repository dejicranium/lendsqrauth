const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const signup = require('mlar')('signupservice');
const bcrypt = require('bcrypt');
const AuditLog = require('mlar')('audit_log');
const send_email = require('mlar').mreq('notifs', 'send');
const config = require('../../config');
const requests = require('mlar')('requests');
const initState = require('../../utils/init_state');

/**  this is to be used by a borrower to reject a collections invitation 
 *  sent to him by a lender.
 * 
 * The Lenderr should be notified about the outcome
 *   
 */
var spec = morx.spec({})
    .build('token', 'required:true')
    /*.build('first_name', 'required:true')
    .build('last_name', 'required:true')*/
    .build('password', 'required:true')
    .build('password_confirmation', 'required:true')
    // .build('email', 'required:true')
    // .build('phone', 'required:true')
    .end();


// TODO: make type borrower
// TODO: 
// TODO: make sure that if there is no profile, create one for a user
function service(data) {
    var d = q.defer();
    const globalUserId = data.USER_ID || 1;
    q.fcall(async () => {

            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });

            const params = validParameters.params;

            return [models.borrower_invites.findOne({
                where: {
                    token: params.token
                }
            }), params];
        })
        .spread(async (instance, params) => {

            if (!instance) throw new Error("Invalid token");
            if (instance.token_is_used) throw new Error("Token has already been used");

            return [models.collection.findOne({
                where: {
                    id: instance.collection_id
                },
                /*include: [{
                    model: models.product
                }]*/
            }), instance, params];
        })
        .spread(async (collection, instance, params) => {
            if (!collection) throw new Error("Could not find collection associated with this invitation");

            let product = await models.collection_init_state.findOne({
                where: {
                    collection_id: collection.id
                }
            });

            //collection = JSON.parse(JSON.stringify(collection));
            collection.product = JSON.parse(product.state);

            assert.mustBeValidPassword(params.password);
            if (params.password !== params.password_confirmation) throw new Error("Passwords do not match");


            // get borrowers profile with user details
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

            // update password;

            user.password = await bcrypt.hash(params.password, 10);
            user.active = 1; // set user to active

            return [user.save(), collection, instance]

        })
        .spread(async (user, collection, instance) => {
            if (!user) throw new Error("There was an error with the sign up");
            let lender = await models.profile.findOne({
                where: {
                    id: collection.lender_id
                },
                include: [{
                    model: models.user,
                    attributes: {
                        exclude: ['password']
                    }
                }]

            });

            let borrower = await models.profile.findOne({
                where: {
                    id: collection.borrower_id
                },
                include: [{
                    model: models.user,
                    attributes: {
                        exclude: ['password']
                    }
                }]

            });
            // if (signup_info.id) {
            //     // create a borrower profile for the user
            //     let borrower_role = await models.role.findOne({
            //         where: {
            //             name: 'borrower'
            //         }
            //     })
            //
            //     let new_borrower_profile = await models.profile.create({
            //         user_id: signup_info.id,
            //         role_id: borrower_role.id,
            //         parent_profile_id: collection.profile_id
            //     });

            // update the collection 
            collection.update({
                status: 'active',
            });

            // invalidate token 
            await instance.update({
                token_is_used: true,
                status: 'Accepted',
                date_joined: new Date(),
            })





            // prepare to send emails

            const LENDER_COLLECTION_CONFIRMATION_EMAIL_CONTEXT_ID = 104;
            const BORROWER_COLLECTION_CONFIRMATION_EMAIL_CONTEXT_ID = 103;

            let confirmation_email_payload = {
                lenderFullName: lender.user.first_name ? lender.user.first_name + ' ' + lender.user.last_name : lender.user.business_name,
                loanAmount: collection.amount,
                borrowerName: collection.borrower_first_name + ' ' + collection.borrower_last_name,
                interestRate: collection.product.interest + '%',
                interestPeriod: collection.product.interest_period,
                tenor: collection.tenor + ' ' + collection.product.tenor_type,
                link: config.base_url + 'collections',
                collectionScheduleURL: config.base_url + 'collections', //TODO: makee sure that this links to reapyment schedule url
                loanRepaymentScheduleURL: config.base_url + 'collections'
            };



            // SEND!
            send_email(LENDER_COLLECTION_CONFIRMATION_EMAIL_CONTEXT_ID, lender.user.email, confirmation_email_payload);
            send_email(BORROWER_COLLECTION_CONFIRMATION_EMAIL_CONTEXT_ID, borrower.user.email, confirmation_email_payload);


            // create loan schedule
            let product = await models.product.findOne({
                where: {
                    id: collection.product_id
                }
            });
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



            let borrower_userId = null;

            if (borrower && borrower.user_id) {
                borrower_userId = borrower.user_id;
            }


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

            data.reqData.user = JSON.parse(JSON.stringify(user));
            let audit = new AuditLog(data.reqData, "SIGN UP", "signed up as through borrower invitation");
            await audit.create();

            d.resolve({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone: user.phone
            })
        })
        .catch((error) => {
            //console.log(error.stack)
            d.reject(error);
        })

    return d.promise;
}
service.morxspc = spec;
module.exports = service;