const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');
const deleteService = require('mlar').mreq('services', 'product/delete');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Product service', () => {
    const params = {
        product_id: 1
    }

    it("should delete product", (done) => {
        deleteService(params).then((result)=>{
            result.should.be.equal('Successfully deleted product');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
