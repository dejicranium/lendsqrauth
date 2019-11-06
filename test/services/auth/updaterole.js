const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const updaterole = require('mlar').mreq('services', 'auth/updaterole');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Sign up user', () => {
    const params = {
       type: 'borrower',
       role_id: 1
       
    }

    it("should update role", (done) => {
        updaterole(params).then((result)=>{
            result.should.be.a('string');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
