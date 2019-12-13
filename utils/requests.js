let constants = require('mlar')('constants');
let config = require('../config')
const makeRequest = require('mlar')('makerequest');
const q = require('q')
const moment = require('moment')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


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

        /*
        let tenor = data.tenor;
        let tenor_type = data.tenor_type;
        let amount = data.amount;
        let num_of_collections = data.num_of_collections;
        let collection_frequency = data.collection_frequency;
        let start_date = data.start_date;
        */
        let tenor_type_value = null;
        switch (data.tenor_type) {
            case 'weeks':
                tenor_type_value = 1;
                break;
            case 'months':
                tenor_type_value = 2;
                break;
            case 'years':
                tenor_type_value = 3;
                break;
            default:
                tenor_type_value = 1;
                break;

        }

        const d = q.defer()
        let params = {
            "dateFormat": "dd MMMM yyyy",
            "locale": "en_GB",
            "productId": 1,
            "clientId": 1,
            "principal": "200000.00",
            "loanTermFrequency": 12,
            "loanTermFrequencyType": 2,
            "numberOfRepayments": 10,
            "repaymentEvery": 1,
            "repaymentFrequencyType": 2,
            "interestRatePerPeriod": 2,
            "amortizationType": 1,
            "interestType": 0,
            "interestCalculationPeriodType": 1,
            "expectedDisbursementDate": "20 September 2011",
            "transactionProcessingStrategyId": 2,
            "submittedOnDate": "20 September 2011",
            "loanType": "individual",
        }

        /*
        let params = {
            "dateFormat": "dd MMMM yyyy",
            "locale": "en_GB",
            "productId": 1,
            "clientId": 1,
            "principal": "200000.00",
            "loanTermFrequency": data.tenor, // 12
            "loanTermFrequencyType": tenor_type_value,
            "numberOfRepayments": data.num_of_collections,
            "repaymentEvery": 1,
            "repaymentFrequencyType": tenor_type_value,
            "interestRatePerPeriod": data.interest,
            "amortizationType": 1,
            "interestType": 0,
            "interestCalculationPeriodType": 1,
            "expectedDisbursementDate": "20 September 2011", //moment(data.disbursement_date).format('DD MMMM YYYY'), //"20 September 2011"
            "transactionProcessingStrategyId": 2,
            "submittedOnDate": "20 September 2011", // moment().format('DD MMMM YYYY'), //"20 September 2011",
            "loanType": "individual",
        }*/
        const url = config.mifos_base_url + `loans?command=calculateLoanSchedule`

        q.fcall(() => {
                return makeRequest(url, 'POST', params, constants.mifos_headers, null, false);
            })
            .then(response => {
                //d.resolve(moment(data.disbursement_date).format('DD MMMM YYYY'))
                console.log(response)
                d.resolve(response)

            })
            .catch(error => {
                console.log(error)
                d.reject(error)
            })

        return d.promise
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

                let url = config.utility_base_url + 'verify/bank';
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

    getBankDetails() {
        const d = q.defer();

        q.fcall(() => {

                let url = config.utility_base_url + 'codes/fetch/bank';
                let payload = {}

                return makeRequest(url, 'GET', payload, constants.requestHeaders, 'verify bank account');
            })
            .then(response => {
                d.resolve(response)
            })
            .catch(err => {
                d.reject(err);
            })

        return d.promise
    },

    verifyBankAccount(data) {
        const d = q.defer();

        q.fcall(() => {

                let url = config.utility_base_url + 'verify/bank';


                return makeRequest(url, 'GET', data, constants.requestHeaders, 'verify account');
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