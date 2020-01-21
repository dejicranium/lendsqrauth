const models = require('mlar')('models');
const q = require('q');

module.exports = {
    async getRoleName(role_id) {
        const d = q.defer();

        q.fcall(() => {
                return models.role.findOne({
                    where: {
                        id: role_id
                    }
                })
            })
            .then(role => {
                if (!role) {
                    d.resolve('')
                } else [
                    d.resolve(role.name)
                ]
            })
            .catch(err => {
                d.reject(err)
            })

        return d.promise
    },

    async getRoleId(roleName) {
        const d = q.defer();

        q.fcall(() => {
                return models.role.findOne({
                    where: {
                        name: roleName
                    }
                })
            })
            .then(role => {
                if (!role) {
                    d.resolve('')
                } else [
                    d.resolve(role.id)
                ]
            })
            .catch(err => {
                d.reject(err)
            })

        return d.promise
    },



}