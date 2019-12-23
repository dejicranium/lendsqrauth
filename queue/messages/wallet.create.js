module.exports = function(data) {
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
            },
            "message_type": {
                DataType: "String",
                StringValue: "wallet.create",
            }
        },
    }



}



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
        },
        "message_type": {
            DataType: "String",
            StringValue: "wallet.create",
        }
    },
    MessageBody: JSON.stringify(c),
    //MessageGroupId: "CollectionsDue",
    QueueUrl: config.collection_schedules_queue_url,
};

module.exports = {
    message: messageData
};