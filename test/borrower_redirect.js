const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');
const borrowerRedirect = require('../services/collection/borrower_redirect')
const utils = require('../utils/bank');


describe('#Borrower redirect', function () {

    this.timeout(500000);


    it('should redirect borrower', async (done) => {
        let result = await borrowerRedirect({
            token: '6ff6b0c6cc137046d6f0976e05608aa8e13f6d7ec71313ecaf03b50ff71b11c4'
        });
        result.should.be.a('object')

        console.log(result)
    })
})