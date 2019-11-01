const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const create = require('mlar').mreq('services', 'profile/get_user_profiles');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Profile service', () => {
    const params = {
        user_id: 1,
       
    }

    it("should get user's profiles", (done) => {
        create(params).then((result)=>{
            result.should.be.a('object');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
