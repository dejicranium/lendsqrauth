const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const createrole = require('mlar').mreq('services', 'auth/test_delete_bvn');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Create role', () => {
    const params = {
       type: 'lender'
       
    }

    it("should delete a new role", (done) => {
        createrole(params).then((result)=>{
            result.should.be.a('object');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
