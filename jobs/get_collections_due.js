const cron = require('node-cron');
const collections = require('mlar').mreq('mocks', 'collections');
const moment = require('moment');
const send_message_to_queue = require('mlar').mreq('queue', 'send_message');
const config = require('../config');

module.exports = () => {
    function getCollectionsDue() {
        let collections_due = [];
        collections.forEach(collection => {
            if (moment().diff(new Date(collection.date_due), 'days') == 0) {
                collections_due.push(collection);
            }
        })
        return collections_due;
    }
    cron.schedule('* * * * * *', () => {
        let collections = getCollectionsDue();
        collections.forEach(async c => {

            let messageData = {
                MessageAttributes: {
                    "name": {
                        DataType: "String",
                        StringValue: c.name

                    },
                    "date_due": {
                        DataType: "String",
                        StringValue: c.date_due
                    },
                    "comment": {
                        DataType: "String",
                        StringValue: c.comment
                    }
                },
                MessageBody: JSON.stringify(c),
                //MessageGroupId: "CollectionsDue",
                QueueUrl: config.collection_schedules_queue_url,
            }

            await send_message_to_queue(messageData);

        })
    })
}