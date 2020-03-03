const send_message_to_queue = require('mlar').mreq('queue', 'send_message');
const config = require('../../config');

async function sendEmail(context_id, recipient, payload) {
  let action_type = 'send_email';
  context_id = context_id.toString();

  let messageData = {
    MessageAttributes: {
      context_id: {
        DataType: 'String',
        StringValue: context_id
      },
      recipient: {
        DataType: 'String',
        StringValue: recipient
      },
      sender: {
        DataType: 'String',
        StringValue: process.env.sender_email
      },
      action_type: {
        DataType: 'String',
        StringValue: 'send_email'
      }
    },
    MessageBody: JSON.stringify({ context_id, recipient, payload, action_type, sender: config.sender_email }),
    //MessageGroupId: "CollectionsDue",
    QueueUrl: process.env.sqs_jobs_queue_url
  };

  return await send_message_to_queue(messageData);
}

module.exports = sendEmail;
