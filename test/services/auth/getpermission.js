const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const getter = require('mlar').mreq('services', 'auth/getpermissions');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Get permission', () => {
    const params = {
       permission_id: 1,
       fetch_one: 1
    }

    it("should get a permission", (done) => {
        
        getter(params).then((result)=>{
            result.should.be.a('object');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
    it("should get permissions", (done) => {
        
        getter(null).then((result)=>{
            result.should.be.a('array');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
