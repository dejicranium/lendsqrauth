const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

var detectchange = require('mlar')('detectchange');
const requests = require('mlar')('requests');
const coll = require('../utils/collections');


describe('#Utils ', function(done) {
    this.timeout(1000000000);
    it("should detect change", () => {
        let old_params = {
            a: 'a',
            b: 'b'
        };

        let new_params = {
            a: 'b',
            b: 'b',
        };

        let result = detectchange(old_params, new_params);

        result.should.be.equal(false);
        console.log(result)
    })

    it("should create a collection schedule", (done) => {

        let params = {
            tenor: 1,
            tenor_type: 'months',
            num_of_collections: 2,
            interest: 15,
            disbursement_date: "2020-01-01"
        };
        requests.createCollectionSchedule(params).then(resp=> {
            console.log(resp);
            resp.should.be.a('object');
            done()

        }).catch(err=> {
            console.log(err)
            done(err);
        })
    });

    it("should test collection validity", (done) => {
        let r = coll.validateSetup(3, 'months', 2, 'monthly');
        r.should.be.equal("PROCEED");
        console.log(r);
    });
});

/*
models.question.findAll({
	include:[{
		model:models.answer,
		required:false, 
		where:{
			id:null
		},
		order:[['createdAt', 'DESC']]
	}]
}).then(qs => {
	 
	qs = qs.map((s) => {return s.toJSON();});
	console.log(qs);

})*/