let constants = require('mlar')('constants');
let config = require('../config')
const makeRequest = require('mlar')('makerequest');
const q = require('q')
const moment = require('moment');
const models = require('mlar')('models');
const normalizeTenor = require('../utils/collections').normalizeTenor;
const resolveCollectionStartDate = require('../utils/collections').resolveStartDate;


module.exports = {
    inviteBorrower(email, payloadData) {
        const d = q.defer();
        q.fcall(() => {
                let url = config.notif_base_url + 'email/send';
                let payload = {
                    sender_id: 1,
                    context_id: 95,
                    recipient: email,
                    sender: config.sender_email,
                    data: payloadData
                };
                return makeRequest(url, 'POST', payload, constants.requestHeaders, 'Invite borrower');
            })
            .then(response => {
                d.resolve(response)
            })
            .catch(err => {
                d.reject(err);
            });

        return d.promise
    },

    createWallet(data) {
        const d = q.defer();
        let payload = {
            firstname: data.firstname,
            lastname: data.lastname,
            user_id: data.user_id
        }
        q.fcall(() => {
                let url = config.wallet_service_base_url + 'wallets';
                return makeRequest(url, 'POST', payload, constants.requestHeaders, 'create wallet');
            })
            .then(response => {
                console.log(response);
                d.resolve(response)
            })
            .catch(err => {
                console.log(err);
                d.reject(err);
            });

        return d.promise
    },


    createCollectionSchedule(data) {

        /*
        let tenor = data.tenor;
        let tenor_type = data.tenor_type;
        let amount = data.amount;
        let num_of_collections = data.num_of_collections;
        let collection_frequency = data.collection_frequency;
        let start_date = data.start_date;
        */

        let tenor_type_value = null;
        let collection_frequency = null;

        // normalize the tenor;

        let normalizedTenor = normalizeTenor(data.tenor, data.tenor_type, data.num_of_collections, data.collection_frequency);
        data.tenor = normalizedTenor[0];
        data.tenor_type = normalizedTenor[1];

        data.start_date = resolveCollectionStartDate(data.start_date); // resolve when collection should start -

        switch (data.tenor_type) {
            case 'days':
                tenor_type_value = 0;
                break;
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

        }
        switch (data.collection_frequency) {
            case 'daily':
                collection_frequency = 0;
                break;
            case 'weekly':
                collection_frequency = 1;
                break;
            case 'monthly':
                collection_frequency = 2;
                break;
            default:
                collection_frequency = 1;
        }
        let repayment_model = null;


        switch (data.repayment_model) {
            case 'equal installments':
                repayment_model = 1;
                break;
            default:
                repayment_model = 0;
        }



        let params = {
            "dateFormat": "dd MMMM yyyy",
            "locale": "en_GB",
            "productId": 1,
            "clientId": 1,
            "principal": data.amount,
            "loanTermFrequency": data.tenor,
            "loanTermFrequencyType": tenor_type_value,
            "numberOfRepayments": data.num_of_collections,
            "repaymentEvery": 1,
            "repaymentFrequencyType": collection_frequency,
            "interestRatePerPeriod": data.interest,
            "interestRateFrequencyType": data.interest_period,
            "amortizationType": repayment_model,
            "interestType": repayment_model == 1 ? 1 : 0,
            "interestCalculationPeriodType": 1,
            "expectedDisbursementDate": moment(data.start_date).format('DD MMMM YYYY'), //"20 September 2011"
            "transactionProcessingStrategyId": 2,
            "submittedOnDate": moment().format('DD MMMM YYYY'), //"20 September 2011",
            "loanType": "individual",
        }

        const d = q.defer();

        const url = config.mifos_base_url + `loans?command=calculateLoanSchedule`

        q.fcall(async () => {
                console.log('weerwer')
                return makeRequest(url, 'POST', params, constants.mifos_headers, null, false);
            })
            .then(response => {
                //if(!response) throw new Error(response);
                //d.resolve(moment(data.disbursement_date).format('DD MMMM YYYY'))
                console.log('response is ' + response);
                // console.log(response)
                d.resolve(response)

            })
            .catch(error => {
                console.log(" error" + error);
                // console.log(error.response.data.errors)

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

    sendNewActiveUserEmail(data) {
        const d = q.defer();
        q.fcall(() => {
            let url = config.notif_base_url + 'email/send';
            let payload = {
                sender_id: 1,
                context_id: 98,
                recipient: data.email,
                sender: config.sender_email,
                data: {
                    lenderFullName: data.lenderFullName
                }
            };
            return makeRequest(url, "POST", payload, constants.requestHeaders, "send email to new active user");
        }).then(sent => {
            if (!sent) throw new Error("Could not send email to new active user");
            else {
                d.resolve(sent);
            }
        }).catch(error => {
            d.reject(error);
        });

        return d.promise;
    },

    getBanks(data) {
        const d = q.defer();
        q.fcall(() => {
                let url = config.utility_base_url + 'util/fetch/bank';
                return makeRequest(url, 'GET', payload, constant.requestHeaders, 'get banks');
            })
            .then(response => {
                d.resolve(response)
            })
            .catch(err => {
                d.reject(err)
            })

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