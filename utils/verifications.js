const config = require('../config');
const makeRequest = require('mlar')('makerequest')

async function verifyBVN(bvn) {

    // first verify that there is a bvn
    let url = config.utility_base_url + "verify/bvn";
    let payload = {
        bvn: bvn
    };

    let verifiedBVN = await makeRequest(url, 'POST', payload, {
        'Content-Type': 'application/json'
    }, 'Verify BVN');

    if (verifiedBVN && verifiedBVN.mobile) {} else {
        throw new Error("Could not verify BVN");
    }

    return verifiedBVN.mobile;


}

async function verifyPhone(phone) {

    // make request to verify phone number
    const verifiedPhone = await makeRequest(
        config.utility_base_url + 'verify/phone/',
        'POST', {
            phone: phone
        }, {
            'Content-Type': 'application/json'
        },
        'validate phone number'
    )

}

module.exports = {
    verifyBVN,
    verifyPhone
};