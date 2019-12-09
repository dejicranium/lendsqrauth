const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const creator = require('mlar').mreq('services', 'auth/createpermission');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Create permission', () => {
    const params = {
        name: 'approve_loans',
        description: 'Allows permitted user to approve loans'

    }

    it.skip("should create a new permission", (done) => {
        creator(params).then((result) => {
                result.should.be.a('object');
                done();
            })
            .catch(err => {
                done(err);
            })

    })
})