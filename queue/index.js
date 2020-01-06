let config = require('../config')


const AWS = require('aws-sdk');
AWS.config.update({
    region: config.aws_region
});

const sqs = new AWS.SQS({
    apiVersion: '2012-11-05'
})
module.exports = sqs