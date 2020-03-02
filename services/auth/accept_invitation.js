const models = require('mlar')('models');
const morx = require('morx');
const q = require('q');
const AuditLog = require('mlar')('audit_log');

/**
 * Accept invitation module
 * Implemented to enable team members to accept collaboration invitation
 * @module auth/accept_invitation
 *
 * @typdef {Object} ModulePayload
 * @property {string} token - invitation token
 * 
 * @param {ModulePayload} data - The {@link ModulePayload} payload
 * @returns {Promise} - Invitation accepted message
 */

var spec = morx
  .spec({})
  .build('token', 'required:true')
  .end();

function service(data) {
  const d = q.defer();

  q.fcall(async () => {
      var validParameters = morx.validate(data, spec, {
        throw_error: true
      });
      let params = validParameters.params;

      return models.user_invites.findOne({
        where: {
          token: params.token
        }
      });
    })
    .then(async invite => {
      if (!invite) throw new Error('No such invitation exists');
      await invite.update({
        status: 'accepted'
      });

      // add a parent_profile when it's accepted
      let accepted_user_profile = await models.profile.findOne({
        where: {
          id: invite.profile_created_id
        }
      });

      if (accepted_user_profile && accepted_user_profile.id) {
        // add a parent_profile when it's accepted
        accepted_user_profile.parent_profile_id = invite.inviter;
        accepted_user_profile.status = 'active';
        await accepted_user_profile.save();
      }

      //data.reqData.user = {id: invite.user_created_id}
      let audit = new AuditLog(data.reqData, 'CREATE', 'accepted membership invitation from user ' + invite.inviter);
      await audit.create();

      d.resolve(`Invitation accepted`);
    })
    .catch(err => {
      d.reject(err);
    });

  return d.promise;

  return d.promise;
}
service.morxspc = spec;
module.exports = service;