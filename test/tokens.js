const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');
const tokenCreateOrUpdate = require('../utils/tokens').createOrUpdate


describe('#Token Service', function () {

    this.timeout(500000);


    it('should create or updatee tokeen', async (done) => {

        tokenCreateOrUpdate('borrower_invites', {
                inviter_id: 2,
                collection_id: 1
            }, {}).then((result) => {
                console.log(result);
                result.should.be.a('string');
                done();
            })
            .catch(err => {
                done(err);
            })



    })


    it('getRoleId', async (done) => {

        utils.getRoleId('admin').then((result) => {
                console.log(result);
                result.should.be.a('string');
                done();
            })
            .catch(err => {
                done(err);
            })
    })
})