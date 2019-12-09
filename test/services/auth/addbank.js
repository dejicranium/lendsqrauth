const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const changepassword = require('mlar').mreq('services', 'auth/changepassword');



describe('#Bank service', () => {
    const params = {
        'user_id': 1,
        'current_password': 'stayloyal',
        'new_password': 'maximum_security',
        'confirm_password': 'maximum_security',
    }

    it.skip("should successfully create user's password", (done) => {
        changepassword(params).then((result) => {
                result.should.be.equal("Successfully changed user's password");
                done();
            })
            .catch(err => {
                done(err);
            })

    })
})