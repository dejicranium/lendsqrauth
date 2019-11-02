const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const create = require('mlar').mreq('services', 'product/create');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Profile service', () => {
    const params = {
        lender_id: 2,
        product_name: 'Loan for fintech businesses',
        product_description: 'No one better',
        repayment_model: 'Installments',
        min_loan_amount: 10000000,
        max_loan_amount: 50000000,
        min_tenor_type: "days",
        min_tenor: "15",
        max_tenor_type: "days",
        max_tenor: "50",
        interest: "5",
        status: "deactivated",
       
    }

    it("should create user's profile", (done) => {
        create(params).then((result)=>{
            result.should.be.a('integer');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
