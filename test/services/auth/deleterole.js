const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const deleteService = require('mlar').mreq('services', 'auth/deleterole');



describe('#Get user service', () => {
    let params = {
        role_id: 1
    }

    it('should delete a role', (done) => {
        deleteService(params).then((result)=>{
            result.should.be.a('object');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
