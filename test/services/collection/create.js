const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const create = require('mlar').mreq('services', 'collection/create');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Collection service', () => {
    const params = {
        name: "Loan 1",
        email: 'itisd3ji@gmail.com',
        product_id: 3,
        tenor: 15,
        borrower_id: 1,
        loan_amount: 50000000,
        loan_status: "active",
        start_date: new Date()
       
    }

    it("should create a collection", (done) => {
        create(params).then((result)=>{
            result.should.be.a('object');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
