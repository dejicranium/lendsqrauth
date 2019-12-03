let constants = require('mlar')('constants');
let config = require('../config')
const makeRequest = require('mlar')('makerequest');
const q = require('q')


module.exports = {
    inviteBorrower(email, payloadData) {
        const d = q.defer();
        q.fcall(() => {

            let url = config.notif_base_url + 'email/send';
            let payload = {
                sender_id:1,
                context_id: 89,
                recipient: email,
                sender: config.sender_email,
                data: {
                    ...payloadData
                }
            }
            
            return makeRequest(url, 'POST', payload, constants.requestHeaders, 'Invite borrower');
        })
        .then(response=> {
            d.resolve(response)
        })
        .catch(err=> {
            d.reject(err);
        })

        return d.promise
    },

    notifyLoanCreated(email) {
        const d = q.defer();
        q.fcall(() => {

            let url = config.notif_base_url + 'email/send';
            let payload = {
                sender_id:1,
                context_id: 65,
                recipient: email,
                sender: config.sender_email,
                data: {
                }
            }
            
            return makeRequest(url, 'POST', payload, constants.requestHeaders, 'notify lender of loan created');
        })
        .then(response=> {
            d.resolve(response)
        })
        .catch(err=> {
            d.reject(err);
        })

        return d.promise
    },

    notifyProductCreated(email) {
        const d = q.defer();
        q.fcall(() => {

            let url = config.notif_base_url + 'email/send';
            let payload = {
                sender_id:1,
                context_id: 66,
                recipient: email,
                sender: config.sender_email,
                data: {
                    
                }
            }
            
            return makeRequest(url, 'POST', payload, constants.requestHeaders, 'notify product creation');
        })
        .then(response=> {
            d.resolve(response)
        })
        .catch(err=> {
            d.reject(err);
        })

        return d.promise
    },

    createCollectionShedule(data) {
        
    },
    verifyBank(data) {
        const d = q.defer();
        
        q.fcall(() => {

            let url = config.notif_base_url + 'verify/bank';
            let payload = {
                account_number: data.account_number,
                bank_code: data.bank_code
            }
            
            return makeRequest(url, 'POST', payload, constants.requestHeaders, 'verify bank account');
        })
        .then(response=> {
            d.resolve(response)
        })
        .catch(err=> {
            d.reject(err);
        })

        return d.promise
    }
}