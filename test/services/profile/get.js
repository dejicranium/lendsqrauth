const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const create = require('mlar').mreq('services', 'profile/get');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Profile service', () => {
    const params = {
        profile_id: 1,
       
    }

    it("should get user's profile", (done) => {
        create(params).then((result)=>{
            result.should.be.a('object');
            result.should.have.property('type');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
