const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const create = require('mlar').mreq('services', 'profile/filter');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Profile service', () => {
    const query = {
        type: 'lender',
       
    }

    it("should get user's profiles", (done) => {
        create(query).then((result)=>{
            result.should.be.a('object');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
