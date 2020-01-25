const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');
const inviteUser = require('../services/auth/inviteuser')
const completeRegistration = require('../services/auth/completeregistration')

const checktoken = require('mlar').mreq('services', 'auth/checktoken');
const generateRandom = require('mlar')('testutils').generateRandom;
const downloadUtil = require('../utils/download')


describe('#Download Service', function () {

    this.timeout(500000);
    const data = [{
        name: 'Deji',
        sex: 'Male'
    }]
    const fields = ['name', 'sex'];


    it('should download stuff', async (done) => {


        downloadUtil(data, 1, null, null, null, fields).then((result) => {
                //console.log(result);
                console.log(result)
                result.should.be.a('integer');
                done();
            })
            .catch(err => {
                console.log(err)
                done(err);
            })

    })
})