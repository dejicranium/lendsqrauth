const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const update = require('mlar').mreq('services', 'product/update');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Product service', () => {
    const params = {
        product_id: 1,
        lender_id: 2,
        product_name: 'Loan for big agro businesses',
       
    }

    it("should update product", (done) => {
        update(params).then((result)=>{
            result.should.be.a('object');
            result.should.have.property('product_name');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
