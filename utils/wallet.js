const makeRequest = require('mlar')('makerequest');
const config = require('../config');
const q = require('q');
module.exports = {
    async create(user) {
        let firstName = user.first_name || user.business_name;
        let lastName = user.last_name || user.business_name;
        let userId = user.id;
        let service_access_key = '34$4l43*(z.er1*(7)&^'
        const d = q.defer();
        q.fcall(() => {
                return makeRequest(config.wallet_service_base_url + 'wallets/ext_create', 'POST', {
                    firstname: firstName,
                    lastname: lastName,
                    service_access_key: service_access_key,
                    user_id: userId
                }, {}, null, false, true)
            })
            .then(resp => {
                d.resolve(resp)
            })
            .catch(err => {
                d.reject(err)
            })

        return d.promise;


    }
}