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


    it('settimeount', async (done) => {
        let moment = require('moment')
        let result = "DONE"
        let then = moment()
        setTimeout(function () {
            let now = moment();

            console.log(" took " + now.diff(then, 'seconds'), ' seconds')

            result.should.be.equal("DONE")
            /// console.log(result)
        }, 6000)


    })
})