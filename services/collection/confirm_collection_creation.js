const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const config = require('../../config');
const makeRequest = require('mlar')('makerequest');
const crypto = require('crypto');
const requests = require('mlar')('requests');
const AuditLog = require('mlar')('audit_log');
const sendCollectionCreatedEmail = require('../../utils/notifs/collection_created');
const validateBorrowerBvnUniqueness = require('../../utils/collections').validateBorrowerBvnUniqueness
const verifications = require('../../utils/verifications');
const send_email = require('mlar').mreq('notifs', 'send');
const moment = require('moment');

var spec = morx.spec({})
    .build('collection_id', 'required:true, eg:lender')

    .end();





function service(data) {

    var d = q.defer();


    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;

            return models.collection.findOne({
                where: {
                    id: params.collection_id
                }
            })
        })
        .then(async (collection) => {
            if (!collection) d.resolve({})
            let product = await models.collection_init_state.findOne({
                where: {
                    collection_id: collection.id
                }
            })
            product = JSON.parse(product.state)
            let lender_name = data.user.business_name || data.user.first_name + ' ' + data.user.last_name;


            let email_payload = {
                lenderFullName: lender_name,
                loanAmount: collection.amount + ` NGN`,
                interestRate: product.interest + " %",
                interestPeriod: product.interest_period,
                tenor: collection.tenor + ' ' + product.tenor_type,
                borrowersFullName: collection.borrower_first_name + ' ' + collection.borrower_last_name,
                rejectURL: config.base_url + 'signup/borrower/reject?token=',
                acceptURL: config.base_url + 'signup/borrower/accept?token=',
                collectionURL: config.base_url + 'collections'
            };

            /// send collection set up email;
            let COLLECTION_SETUP_EMAIL_CONTEXT_ID = 105;
            send_email(COLLECTION_SETUP_EMAIL_CONTEXT_ID, data.user.email, email_payload);

            let invitation = await models.borrower_invites.findOne({
                where: {
                    collection_id: collection.id,
                }
            });

            invitation.next_reminder_date = moment().add(4, 'days'); //post date the next invitation
            await invitation.save();


            if (invitation && invitation.id) {
                /// get the user record so that we can define whether or not we are inviting a new user or not
                let borrower = await models.profile.findOne({
                    where: {
                        id: collection.borrower_id
                    },
                    include: [{
                        model: models.user
                    }]
                });

                let borrower_is_new_user = !borrower.user || !borrower.user.password;

                if (borrower_is_new_user) {
                    email_payload.acceptURL = config.base_url + 'signup/borrower?token=' + invitation.token + '&email=' + collection.borrower_email;
                } else {
                    email_payload.acceptURL = config.base_url + 'login?email=' + collection.borrower_email + '&token=' + invitation.token;
                }
                email_payload.rejectURL += invitation.token;
            }

            return requests.inviteBorrower(collection.borrower_email, email_payload);

        })
        .then(async iv => {
            if (!iv) throw new Error("Could not create invitation");
            d.resolve(iv)
        })
        .catch(err => {
            d.reject(err);
        });

    return d.promise;

}





















service.morxspc = spec;
module.exports = service;