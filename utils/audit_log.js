const models = require('mlar')('models');
const obval = require('mlar')('obval');


class AuditLog {
    constructor(reqData, action_type, action) {
        this.reqData = reqData;
        this.action_type = action_type;
        this.action = action;
    }

    async create() {
        let r = this.reqData;

        if (r.profile) {
            let fields = ['parent_profile_id', 'id', 'email', 'user_id', 'role'];
            r.profile = obval.select(fields).from(r.profile);

            r.profile.profile_id = r.profile.id;
            delete r.profile.id;
        }
        let actor_id = r.user ? r.user.id : null;
        let actor_meta = JSON.stringify({
            ...r.profile,
            ipAddress: r.connection.remoteAddress
        });
        let action_type = this.action_type;
        let action = this.action;
        let date = new Date();

        let logData = {
            actor_id,
            actor_meta,
            action_type,
            action,
            date
        };

        try {
            await models.audit_log.create(logData);
        } catch (e) {
            // silent treatement
            console.log(e.stack);
            throw new Error(e);
        }
    }
}

module.exports = AuditLog;