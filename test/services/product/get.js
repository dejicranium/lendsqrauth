const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const get = require('mlar').mreq('services', 'product/get');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Profile service', () => {
    let params = {
        lender_id: 2,
       
    }

    it("should get lender's products", (done) => {
        get(params).then((result)=>{
            result.should.be.a('object');
            result.should.have.property('page_info');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
    it("should get product by id", (done) => {
        params = {product_id: 1};
        get(params).then((result)=>{
            result.should.be.a('object');
            result.should.have.property('lender_id');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
    it("should get all products", (done) => {
        params = {};
        get(params).then((result)=>{
            result.should.be.a('object');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
