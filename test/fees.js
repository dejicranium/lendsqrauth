const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');
const calculateFees = require('mlar')('feeCalc').calculate


describe('#Fee Service', function () {

    this.timeout(500000);
    

    it('should calculate fees', async (done) => {

        let result = calculateFees(27000);
        console.log(result)
        result.should.be.equal(700)

    })
})