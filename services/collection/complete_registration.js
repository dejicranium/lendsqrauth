const models = require('mlar')('models');
const ErrorLogger = require('mlar')('errorlogger');
const morx = require('morx');
const q = require('q');
const validators = require('mlar')('validators');
const assert = require('mlar')('assertions');
const signup = require('mlar')('signupservice');
const bcrypt = require('bcrypt');
const AuditLog = require('mlar')('audit_log');


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

            return [ models.borrower_invites.findOne({
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
                }
            }), instance, params];
        })
        .spread(async (collection, instance, params) => {
            if (!collection) throw new Error("Could not find collection associated with this invitation");

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
            user.active = 1;            // set user to active

            return [user.save(), collection, instance]

        })
        .spread(async (user, collection, instance) => {
            if (!user) throw new Error("There was an error with the sign up");
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
            d.reject(error);
        })

    return d.promise;
}
service.morxspc = spec;
module.exports = service;