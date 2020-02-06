const models = require('mlar')('models');
const q = require('q');
const config = require('../../config');
const send_email = require('mlar').mreq('notifs', 'send');
const userUtils = require('../../utils/user');


function service(borrower_invite) {
    const d = q.defer();
    const LENDER_INVITATION_CONTEXT_ID = 151
    const BORROWER_INVITATION_CONTEXT_ID = 152

    q.fcall(() => {
        return borrower_invite
    }).then(async borrower_invite => {
        if (!borrower_invite) d.resolve({})


        const collection = await models.collection.findOne({
            where: {
                id: borrower_invite.collection_id
            }
        });

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

        let email_payload = {
            lenderFullName: lender.user.first_name ? lender.user.first_name + ' ' + lender.user.last_name : lender.user.business_name,
            borrowerFullName: collection.borrower_first_name + ' ' + collection.borrower_last_name,
            borrowersFullName: collection.borrower_first_name + ' ' + collection.borrower_last_name,
            collectionURL: config.base_url + 'collections',
            tenor: collection.tenor,
            interestRate: product.interest + '%',
            loanAmount: collection.amount,
            period: product.interest_period,
            declineURL: config.base_url + 'signup/borrower/reject?token=' + borrower_invite.token,
            acceptURL: config.base_url + 'signup/borrower/accept?token=',
        }

        let {
            borrowerUserAccount,
            exists
        } = await userUtils.isRegisteredUser(collection.borrower_email);

        if (exists) {
            email_payload.acceptURL = config.base_url + 'login?email=' + collection.borrower_email + '&token=' + borrower_invite.token;
        } else {
            email_payload.acceptURL = config.base_url + 'signup/borrower?token=' + borrower_invite.token + '&email=' + collection.borrower_email;
        }

        send_email(LENDER_INVITATION_CONTEXT_ID, lender.user.email, email_payload);
        return send_email(BORROWER_INVITATION_CONTEXT_ID, collection.borrower_email, email_payload);

    }).then(emailSent => {
        d.resolve("done")
    }).catch(error => {
        d.reject(error)
    })

    return d.promise;
}

module.exports = service