const send_message_to_queue = require('mlar').mreq('queue', 'send_message');
const config = require('../../config');

async function createWallet(firstname, lastname, user_id) {
    user_id = user_id.toString();
    let action_type = "wallet.create";
    let messageData = {
        MessageAttributes: {
            "firstname": {
                DataType: "String",
                StringValue: firstname,
            },
            "lastname": {
                DataType: "String",
                StringValue: lastname
            },
            "user_id": {
                DataType: "String",
                StringValue: user_id
            },
            "action_type": {
                DataType: "String",
                StringValue:action_type,
            }
        },
        MessageBody: JSON.stringify({firstname, lastname, user_id, action_type}),
        //MessageGroupId: "CollectionsDue",
        QueueUrl: config.sqs_jobs_queue_url,
    };

    return await send_message_to_queue(messageData);

}


module.exports = createWallet;