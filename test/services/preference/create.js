const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const create = require('mlar').mreq('services', 'preference/create');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#preference service', () => {
    const params = {
        name: 'accept_qr_payments',       
    }

    it("create preference", (done) => {
        create(params).then(result => {
            result.should.be.a('object');
            result.should.have_property('name');
            done();
            
        })
        .catch(err=> {
            done(err);
        })

    })
})
