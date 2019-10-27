const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const checktoken = require('mlar').mreq('services', 'auth/checktoken');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Sign up user', () => {
    const params = {
        token: 'password_reset',
        type: '40a3dc2bd11b834ad7234565e2912589ea69507bf13af5e2ade198ab461b4a54',
       
    }

    it ('should verify an auth token', (done) => {
        checktoken(params).then((result)=>{
            console.log(result);
            result.should.be.a('object');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
