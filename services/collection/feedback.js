const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const assert = require('mlar')('assertions');
const requests = require('mlar')('requests');
const makeRequest = require('mlar')('makerequest');
const config = require('../../config');
const resolvers = require('mlar')('resolvers');
const AuditLog = require('mlar')('audit_log');
const moment = require('moment');
const send_email = require('mlar').mreq('notifs', 'send');
const detect_change = require('mlar')('detectchange');
const validateCollectionSetup = require('../../utils/collections').validateSetup;
const validateDateThresholds = require('../../utils/collections').validateDateThresholds;
const initState = require('../../utils/init_state');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var spec = morx
    .spec({})
    .build('token', 'required: true')
    .build('comment', 'required: true')

    .end();

function service(data) {
    var d = q.defer();
    const globalUserId = data.USER_ID || 1;

    q
        .fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;

            const invitation = models.borrower_invites.findOne({
                where: {
                    token: params.token
                }
            })
            return invitation
        })
        .then(invitation => {
            if (!invitation) throw new Error("Invitation record does not exist");
            let collection = await models.collection.findOne({
                where: {
                    id: invitation.collection_id
                }
            });
            // else if invitation found.
            let creationData = {
                invitation_id: invitation.id,
                collection_id: collection.id,
                borrower_email: collection.borrower_email,
                type: "Reason for Decline",
                comment: data.comment
            }

            return model.borrower_feeedbacks.create(creationData);

        })
        .then(feedback => {
            if (!feedback) throw new Error('Could not create feedback')
            d.resolve("Feedback successfully sent to the lender");
        })
        .catch((err) => {
            console.log(err.stack);

            d.reject(err);
        });

    return d.promise;
}
service.morxspc = spec;
module.exports = service;