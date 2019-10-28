const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const setrole = require('mlar').mreq('services', 'auth/setrole');



describe('#RoleService', () => {
    let params = {
        role_id: 1,
        user_id: 1
    }

    it('should set a role', (done) => {
        setrole(params).then((result)=>{
            result.should.be.equal('Successfully set the user role');
            done();
        })
        .catch(err=> {
            done(err);
        })

    })
})
