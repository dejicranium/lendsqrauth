const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const listout = require('mlar').mreq('services', 'auth/getuser');



describe('#Get user service', () => {
    const params = {
        user_id: 1
    }

    it('should get a registered user', (done) => {
        listout(params).then((result)=>{
            result.should.be.a('object');
            result.should.have.property('first_name');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
