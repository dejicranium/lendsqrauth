const dotenv = require('dotenv')

if (process.env.NODE_ENV != 'production') {
    //dotenv.load({ path: '.env' });

    dotenv.config({path: 'env'});
}
module.exports = {
    JWTsecret: process.env.JWTsecret || 'wd#o,9!fPJZ-> L<~%J-VEVGdnlr6(Gq2dq).XHOpQ^v[q4t1^-%Nq ff-jn_s=g',
    JWTexpiresIn: process.env.JWTexpiresIn || 86000
}
