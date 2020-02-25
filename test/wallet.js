const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');
const walletUtil = require('../utils/wallet');

describe('#Complete registration', function () {

    this.timeout(500000);


    it('create wallet', async (done) => {

        walletUtil.create({
                business_name: 'Deji Consult',
                id: 10000
            }).then((result) => {
                //console.log(result);
                result.should.be.a('object');
                done();
            })
            .catch(err => {
                done(err);
            })

    })
})