const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const listout = require('mlar').mreq('services', 'auth/listusers');



describe('#Get users service', () => {
    const params = {
        
    }

    it('should lists registered users', (done) => {
        listout(params).then((result)=>{
            console.log(result);
            result.should.be.a('object');
            result.should.have.property('users');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})