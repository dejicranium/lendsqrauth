const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');
const checktoken = require('mlar').mreq('services', 'auth/checktoken');
let utils = require('../utils/roles');


describe('#Roles Stuff', function () {

    this.timeout(500000);


    it('getRoleName', async (done) => {

        utils.getRoleName(1).then((result) => {
                //console.log(result);
                result.should.be.a('string');
                done();
            })
            .catch(err => {
                done(err);
            })



    })


    it('getRoleId', async (done) => {

        utils.getRoleId('admin').then((result) => {
                //console.log(result);
                result.should.be.a('string');
                done();
            })
            .catch(err => {
                done(err);
            })
    })
})