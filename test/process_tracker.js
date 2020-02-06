const util = require('./../utils/process_tracker');
const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');

describe('#Process Tracker', function () {

    this.timeout(500000);


    it('should get next process cycle paramters', async () => {
        let result = util.next_process_cycle(0, '2020-01-20 00:12:43');
        console.log(result)
        result.should.be.a('object');
    })

})