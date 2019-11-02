const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const create = require('mlar').mreq('services', 'collection/get');
const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Profile service', () => {
    const params = {
        collection_id: 1,
       
    }

    it("should get collection", (done) => {
        create(params).then((result)=>{
            result.should.be.a('object');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
