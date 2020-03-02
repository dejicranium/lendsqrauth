const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');
const getAuditLog = require('../services/audit/get')

describe('#AuditLog Service', function () {

    this.timeout(500000);


    it('should get audit log', (done) => {

        getAuditLog({
                profile: {
                    id: 1,
                    role: "admin"
                },
                user: {
                    id: 1,
                    role: 1
                },
                id: 2
            }).then((result) => {
                console.log(result);
                result['user']['profile'].should.be.have.property('role');
                done();
            })
            .catch(err => {
                done(err);
            })

    })
})