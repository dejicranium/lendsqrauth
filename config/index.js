const dotenv = require('dotenv')

if (process.env.NODE_ENV !== 'production') {
    //dotenv.load({ path: '.env' });

    dotenv.config({
        path: 'env'
    });
}
module.exports = {
    JWTsecret: process.env.JWTsecret || 'wd#o,9!fPJZ-> L<~%J-VEVGdnlr6(Gq2dq).XHOpQ^v[q4t1^-%Nq ff-jn_s=g',
    JWTexpiresIn: process.env.JWTexpiresIn || 86000,
    sender_email: process.env.sender_email || 'support@lendsqr.com',
    notif_base_url: process.env.notif_base_url || 'https://v2-test.lendsqr.com/api/v1/notification/',
    utility_base_url: process.env.utility_base_url || 'https://v2-test.lendsqr.com/api/v1/util/',
    base_url: process.env.base_url || 'http://staging-lb-978527258.us-east-2.elb.amazonaws.com/api/v1/',
    admin_reg_token: process.env.admin_reg_token || 'saraytheiconoclast%32$6',

    aws_region: process.env.aws_region || 'us-east-2',
    collection_schedules_queue_url: process.env.collection_schedules_queue_url || 'https://sqs.us-east-2.amazonaws.com/350152003452/CollectionSchedulesQueue',

    mifos_base_url: process.env.mifos_base_url || 'https://ec2-54-169-251-192.ap-southeast-1.compute.amazonaws.com/fineract-provider/api/v1/',
    mifos_user: process.env.mifos_user || 'mifos',
    mifos_password: process.env.mifos_password || 'password',

    wallet_service_base_url: process.env.wallet_service_base_url || 'https://wallet-service-staging.herokuapp.com/api/v1/',
    sqs_jobs_queue_url: process.env.sqs_jobs_queue_url || 'https://sqs.us-east-2.amazonaws.com/350152003452/LendsqrAsyncJobs'

};