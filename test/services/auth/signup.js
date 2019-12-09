const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const signup = require('mlar').mreq('services', 'auth/signup');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Sign up user', () => {
    let password = "xererererwfsf";
    const signup_params = {
        first_name: generateRandom('string', 10),
        last_name: generateRandom('string', 5),
        password: password,
        password_confirmation: password,
        email: generateRandom('email'),
        phone: generateRandom('string', 10),
        type: 1,
    }

    it.skip('should successfully sign up a user', (done) => {
        signup(signup_params).then((result) => {
                result.should.be.a('object');
                done();
            })
            .catch(err => {
                done(err);
            })

    })
})