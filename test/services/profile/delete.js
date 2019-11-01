const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const create = require('mlar').mreq('services', 'profile/delete');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Profile service', () => {
    const params = {
        profile_id: 1,
       
    }

    it("should delete user's profile", (done) => {
        create(params).then((result)=>{
            result.should.be.a('string');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
