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

    it("decipher jwt", async () => {
        const jwt_decode = require('jwt-decode');
        let r = await jwt_decode("eyJhbGciOiJSUzI1NiIsImtpZCI6ImNkMjM0OTg4ZTNhYWU2N2FmYmMwMmNiMWM0MTQwYjNjZjk2ODJjYWEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiNjAwMzE0MzUyMzc1LXJzMXAzZnZjc3UwdWV2dHI0OGQwdTFjOG1kanVmcTVmLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiNjAwMzE0MzUyMzc1LXJzMXAzZnZjc3UwdWV2dHI0OGQwdTFjOG1kanVmcTVmLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTExMjI1NTE0NDMxODYxNDA5Njk1IiwiaGQiOiJsZW5kc3FyLmNvbSIsImVtYWlsIjoiZGViYmllQGxlbmRzcXIuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJqTXlyLVVGMmF1dWk3ZThfN3UyX0dRIiwibmFtZSI6IkRlYmJpZSBPZ2FuYSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQUF1RTdtQUhvSzNoUjU1bzVaanNqZTVTb3JhRzV6WHV0VE5QcmFqVG5qYz1zOTYtYyIsImdpdmVuX25hbWUiOiJEZWJiaWUiLCJmYW1pbHlfbmFtZSI6Ik9nYW5hIiwibG9jYWxlIjoiZW4iLCJpYXQiOjE1Nzg2NDIwODQsImV4cCI6MTU3ODY0NTY4NCwianRpIjoiYjE4N2UxMjA3Mjc2N2U5MDdiNDZmMWQ2OWFhMjcxOTg0OWExMjU3NCJ9.qR2yBJTEwsHV2YnNTiz6jD25t54MfTDGc5mPkSU246IR1YJPM8ZGakw2uTg3njOnqyCV_ltroQaAg4e6Cskiaq2ahjGpC3uUz7La9nIMvUX4b0ApEfMAnDpdvm-x_C0Nlsv0TWfy3SrhDg3-8ovHUXxHG_gy0LS1MTvOXlw9_zlbpBhJQy4Xbp5ieDOG5SuMYJdhbYoOrL897jmfGMbbkes0hnCSYQaPTuQ1VfmGOhyyfSESENPaDcuJwaKxIYp3JrmsmozTxL0hldmu0D8oMb613x2ywkihVgHfkUwq858xpuLnJBPf-Z8_r_5FrUAld6g9BWw79OezTlswNRFAZA");
        r.should.be.a('object');
        console.log(r)
    });
    it("should throw error", async () => {
        const jwt_decode = require('jwt-decode');
        let r = await coll.normalizeTenor(3, 'weeks', '21', 'monthly');
        r.should.be.a('object');
        console.log(r)
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