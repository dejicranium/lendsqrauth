const models = require('mlar')('models');
const q = require('q');


function service(invite_id) {
    const d = q.defer();
    q.fcall(() => {
        return models.borrower_invites.findOne({
            where: {
                id: invite_id
            }
        })
    }).then(borrower_invite => {
        if (!borrower_invite) d.resolve({})
        else {
            d.resolve(borrower_invite)
        }
    })
}