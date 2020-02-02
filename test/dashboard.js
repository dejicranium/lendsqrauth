const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');
const checktoken = require('mlar').mreq('services', 'auth/checktoken');
const generateRandom = require('mlar')('testutils').generateRandom;
const lenderStats = require('mlar').mreq('services', 'dashboard/admin/lenders_stats');


describe('#Complete registration', function () {

    this.timeout(500000);


    it('lender stats', async (done) => {

        lenderStats({}).then((result) => {
                console.log(result);
                result.should.be.a('object');
                done();
            })
            .catch(err => {
                done(err);
            })

    })
})