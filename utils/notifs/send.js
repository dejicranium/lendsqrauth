let constants = require('mlar')('constants');
let config = require('../../config');
const makeRequest = require('mlar')('makerequest');
const q = require('q')
const moment = require('moment');

async function email(context_id, email, data) {

    let url = config.notif_base_url + 'email/send';
    let payload = {
        sender_id: 1,
        context_id: parseInt(context_id),
        recipient: email,
        sender: config.sender_email,
        data: data
    };
    return await makeRequest(url, 'POST', payload, constants.requestHeaders);
}
module.exports = email;