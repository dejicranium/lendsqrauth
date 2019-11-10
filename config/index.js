const dotenv = require('dotenv')

if (process.env.NODE_ENV != 'production') {
    //dotenv.load({ path: '.env' });

    dotenv.config({path: 'env'});
}
module.exports = {
    JWTsecret: process.env.JWTsecret || 'wd#o,9!fPJZ-> L<~%J-VEVGdnlr6(Gq2dq).XHOpQ^v[q4t1^-%Nq ff-jn_s=g',
    JWTexpiresIn: process.env.JWTexpiresIn || 86000,
    sender_email: process.env.sender_email || 'support@lendsqr.com',
    notif_base_url: process.env.notif_base_url || 'https://v2-test.lendsqr.com/api/v1/notification/',
    utility_base_url: process.env.notif_base_url || 'https://v2-test.lendsqr.com/api/v1/util/'
}