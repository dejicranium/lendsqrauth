const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const changestatus = require('mlar').mreq('services', 'auth/changestatus');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Sign up user', () => {
    const params = {
        user_id: 1,
        status: 'activate',
       
    }

    it("should update user's status", (done) => {
        changestatus(params).then((result)=>{
            console.log(result);
            result.should.be.a('string');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
