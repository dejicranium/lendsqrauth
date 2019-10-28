const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const listout = require('mlar').mreq('services', 'auth/getrole');



describe('#Get user service', () => {
    let params = {
        role_id: 1
    }

    it('should get a registered user', (done) => {
        listout(params).then((result)=>{
            result.should.be.a('object');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
