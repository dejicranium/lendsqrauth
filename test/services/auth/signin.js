const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const signin = require('mlar').mreq('services', 'auth/signin');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Sign up user', () => {
    const params = {
        email: 'itisdeji@gmail.com',
        password: 'intelligent98'
    }

    it('should signin user', (done) => {
        signin(params).then((result)=>{
            console.log(result);
            result.should.be.a('object');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
