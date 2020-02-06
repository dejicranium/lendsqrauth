const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');

const assertions = require('../utils/assertions')


describe('#Assertions', function () {

    this.timeout(500000);


    it('should not be greater than 0', async (done) => {
        let result = assertions.greaterThanZero(1)
        console.log(result)

        result.should.be.a('string');
    })

    it('should not have decimal', async (done) => {
        let result = assertions.notDecimal(3)
        console.log(result)

        result.should.be.a('string');
    })
})