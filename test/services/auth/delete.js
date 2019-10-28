const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const deleteService = require('mlar').mreq('services', 'auth/delete');



describe('#Delete user', () => {
    const params = {
        user_id: 1,
       
    }

    it ('should delete user', (done) => {
        deleteService(params).then((result)=>{
            result.should.be.a('string');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
