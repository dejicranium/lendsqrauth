const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();

const chai = require('chai');

const set = require('mlar').mreq('services', 'auth/setpermission');



describe('#SetPermissionsService', () => {
    const params = {
        entity: 'profile',
        entity_id: 1,
        permission_id: 1
    }

    it.skip('should set permssion', (done) => {
        set(params).then((result) => {
                result.should.be.a('object');
                done();
            })
            .catch(err => {
                done(err);
            })

    })
})