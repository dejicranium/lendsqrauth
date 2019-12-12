const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');

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
    const DECLINED_STATUS = 'borrower_declined';
    var d = q.defer();
    const globalUserId = data.USER_ID || 1;
    q.fcall(async () => {
            const validParameters = morx.validate(data, spec, {
                throw_error: true
            });
            const params = validParameters.params;
            return models.user_invites.findOne({
                where: {
                    token: params.token,
                }
            })
        })
        .then(async (instance) => {
            if (!instance) throw new Error("Invalid token")
            return models.user.findOne({
                where: {
                    email: instance.invitee
                }
            })
        })
        .then(user => {
            if (!user) d.resolve("NOT USER");

            // check whether the borrower email is already a user

            if (!user.password) {
                d.resolve("NOT USER");
            }

            d.resolve("USER")

        })

        .catch((error) => {
            d.reject(error);

        })

    return d.promise;

}
service.morxspc = spec;
module.exports = service;