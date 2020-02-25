const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');
const verifications = require('../utils/verifications');


describe('#Verifications', function () {

    this.timeout(500000);


    it('verify bvn', async () => {

        verifications.verifyBVN('22294409275').then((result) => {
                //console.log(result);
                result.should.be.a('string');
            })
            .catch(err => {
                //console.log(err);
            })

    })

    it('verify phone', async () => {

        verifications.verifyPhone('08100455706').then((result) => {
                //console.log(result);
                result.should.be.a('string');
            })
            .catch(err => {
                //console.log(err);
            })

    })
})