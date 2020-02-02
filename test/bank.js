const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');
const checktoken = require('mlar').mreq('services', 'auth/checktoken');
const generateRandom = require('mlar')('testutils').generateRandom;
const utils = require('../utils/bank');


describe('#Bank Info', function () {

    this.timeout(500000);


    it('getverificationdata', async (done) => {

        utils.getLocalBVNVerificationData(1, 2).then((result) => {
                console.log(result);
                result.should.be.a('object');
                done();
            })
            .catch(err => {
                done(err);
            })

    })
})