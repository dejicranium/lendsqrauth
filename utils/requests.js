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
                    sender_id: 1,
                    context_id: 89,
                    recipient: email,
                    sender: config.sender_email,
                    data: {
                        ...payloadData
                    }
                }

                return makeRequest(url, 'POST', payload, constants.requestHeaders, 'Invite borrower');
            })
            .then(response => {
                d.resolve(response)
            })
            .catch(err => {
                d.reject(err);
            })

        return d.promise
    },

    notifyLoanCreated(email) {
        const d = q.defer();
        q.fcall(() => {

                let url = config.notif_base_url + 'email/send';
                let payload = {
                    sender_id: 1,
                    context_id: 65,
                    recipient: email,
                    sender: config.sender_email,
                    data: {}
                }

                return makeRequest(url, 'POST', payload, constants.requestHeaders, 'notify lender of loan created');
            })
            .then(response => {
                d.resolve(response)
            })
            .catch(err => {
                d.reject(err);
            })

        return d.promise
    },

    notifyProductCreated(email) {
        const d = q.defer();
        q.fcall(() => {

                let url = config.notif_base_url + 'email/send';
                let payload = {
                    sender_id: 1,
                    context_id: 66,
                    recipient: email,
                    sender: config.sender_email,
                    data: {

                    }
                }

                return makeRequest(url, 'POST', payload, constants.requestHeaders, 'notify product creation');
            })
            .then(response => {
                d.resolve(response)
            })
            .catch(err => {
                d.reject(err);
            })

        return d.promise
    },

    createCollectionShedule(data) {

    },

    validatePhone(data) {
        const d = q.defer();

        q.fcall(() => {

                let url = config.utility_base_url + 'verify/phone';
                let payload = {
                    phone: data.phone,
                }

                return makeRequest(url, 'POST', payload, constants.requestHeaders, 'verify phone');
            })
            .then(response => {
                d.resolve(response)
            })
            .catch(err => {
                d.reject(err);
            })

        return d.promise
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
            .then(response => {
                d.resolve(response)
            })
            .catch(err => {
                d.reject(err);
            })

        return d.promise
    },


    calculateCollectionSchedule(data) {
        let tenor = data.tenor;
        let tenor_type = data.tenor_type;
        let amount = data.amount;
        let num_of_collections = data.num_of_collections;
        let collection_frequency = data.collection_frequency;
        let start_date = data.start_date;

        let someting = {
            "dateFormat": "dd MMMM yyyy",
            "locale": "en_GB",
            "productId": 1,
            "principal": "100,000.00",
            "loanTermFrequency": 12,
            "loanTermFrequencyType": 2,
            "numberOfRepayments": 12,
            "repaymentEvery": 1,
            "repaymentFrequencyType": 2,
            "interestRatePerPeriod": 2,
            "amortizationType": 1,
            "interestType": 0,
            "interestCalculationPeriodType": 1,
            "expectedDisbursementDate": "20 September 2011",
            "transactionProcessingStrategyId": 2
        }
    }
}