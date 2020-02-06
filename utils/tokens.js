const models = require('mlar')('models');
const q = require('q');
const crypto = require('crypto');

module.exports = {

    async createOrUpdate(modelName, params, createParams = {}) {
        const d = q.defer();
        q.fcall(() => {
                return models[modelName].findOne({
                    where: params
                })
            })
            .then(async tokenObj => {
                createParams.token = await crypto.randomBytes(32).toString('hex');
                createParams.token_is_used = 0;
                if (!tokenObj) {
                    d.resolve(models[modelName].create(createParams))
                } else {
                    d.resolve(tokenObj.update(createParams))
                }
            })
            .catch(error => {
                d.reject(error)
            })

        return d.promise;
    },


}