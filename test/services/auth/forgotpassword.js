const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const forgotpassword = require('mlar').mreq('services', 'auth/forgotpassword');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Sign up user', () => {
    const params = {
        email: 'itisdeji@gmail.com',
       
    }

    it.skip('should create an auth token', (done) => {
        forgotpassword(params).then((result)=>{
            result.should.be.a('string');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
