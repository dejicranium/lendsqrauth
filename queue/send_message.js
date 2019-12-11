const sqs = require('./index');

module.exports = (data) => {
    let sqs_message = sqs.sendMessage(data).promise();
    sqs_message.then((data) => {
            console.log("Success: " + data.MessageId)
        })
        .catch(err => {
            console.log(err);
        })
}