const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

var detectchange = require('mlar')('detectchange');


describe('#Utils ', () => {

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
})
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