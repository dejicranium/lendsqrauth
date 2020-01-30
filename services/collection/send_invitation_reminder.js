const models = require('mlar')('models');
const q = require('q');
const config = require('../../config');
const send_email = require('mlar').mreq('notifs', 'send');
const userIsRegistered = require('../../utils/user');


function service(invite_id) {
    const d = q.defer();
    const LENDER_INVITATION_CONTEXT_ID = 151
    const BORROWER_INVITATION_CONTEXT_ID = 152

    q.fcall(() => {
        return models.borrower_invites.findOne({
            where: {
                id: invite_id
            }
        })
    }).then(async borrower_invite => {
        if (!borrower_invite) d.resolve({})


        const collection = await models.collection.findOne({
            where: {
                id: borrower_invite.collection_id
            }
        });

        const product = await collection_init_state.findOne({
            where: {
                collection_id: collection.id
            }
        })


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
            collectionURL: config.base_url + 'collections',
            tenor: collection.tenor,
            interestRate: product.interest + '%',
            Period: product.interest_period,
            rejectURL: config.base_url + 'signup/borrower/reject?token=' + borrower_invite.token,
            acceptURL: config.base_url + 'signup/borrower/accept?token=',
        }

        let {
            borrowerUserAccount,
            exists
        } = await userIsRegistered(collection.borrower_email);

        if (exists) {
            acceptURL = config.base_url + 'login?email=' + collection.borrower_email + '&token=' + borrower_invite.token;
        } else {
            acceptURL = config.base_url + 'signup/borrower?token=' + borrower_invite.token + '&email=' + collection.borrower_email;
        }

        send_email(LENDER_INVITATION_CONTEXT_ID, lender.user.email, email_payload);
        return send_email(BORROWER_INVITATION_CONTEXT_ID, borrower.user.email, email_payload);

    }).then(emailSent => {
        d.resolve("done")
    }).catch(error => {
        d.reject(error)
    })

    return d.promise;
}

module.exports = service