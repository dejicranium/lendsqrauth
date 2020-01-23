const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const checktoken = require('mlar').mreq('services', 'auth/checktoken');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Sign up user', () => {
    const params = {
        type: 'password_reset',
        token: '7be3e223c47c0dace4fbe72840f4351539112e3d074882a5ba4a864d266ee402',

    }

    it.skip('should verify an auth token', (done) => {
        checktoken(params).then((result) => {
                //console.log(result);
                result.should.be.a('object');
                done();
            })
            .catch(err => {
                done(err);
            })

    })
})