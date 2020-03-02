let collection_created = require('../../utils/notifs/collection_created');
const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');


describe('#Created Collection notif', () => {
    const payload = {
        email: 'itisdeji@gmail.com',
        lenderFullName: "Deji Atoyebi",
        loanAmount: "15,000",
        interestRate: "15",
        perMonth: "20",
        tenor: "10",
        borrowerName: "Derer",
        collectionURL: ""
    }

    it("should send collection created url", (done) => {
        collection_created(payload).then((result) => {
            result.should.be.a("object");
            console.log(result);
            done();
        }).catch(err => {
            done(err);
        })

    })
})