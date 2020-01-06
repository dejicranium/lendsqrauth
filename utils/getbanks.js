let requests = require('mlar')('requests');
const q = require('q');

module.exports = async (search=false) =>{
    try {
        let bankDetails = await requests.getBankDetails();
        if (search){    // search should be a dict;
            let key = Object.keys(search)[0];
            let value = search[key];

            bankDetails.forEach(detail=> {
                if (detail[key] == value){
                    return detail;
                }
            })
        }
        else {
            return bankDetails;
        }
    }
    catch(err) {
        throw new Error(err.stack)
    }

}