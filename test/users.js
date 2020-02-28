const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');
const createUser = require('./../services/auth/signup');
const searchUsers = require('./../services/auth/listusers')

describe('#User Service', function () {


    this.timeout(500000);

    it('should get all users', (done) => {
        searchUsers({
                profile: {
                    name: 'admin',
                    id: 1
                },

            }).then(resp => {
                console.log(resp)
                resp.should.be.a('object');
                resp.should.have.a.property('page_info');
                resp.should.have.a.property('users');
                done()
            })
            .catch(err => {
                done(err)
            })

    })
    it('should search for users', (done) => {
        searchUsers({
                profile: {
                    name: 'admin',
                    id: 1
                },
                search: 'Deji'

            }).then(resp => {
                console.log(resp)
                resp.should.be.a('object');
                resp.should.have.a.property('page_info');
                resp.should.have.a.property('users');
                resp['users'][0].first_name.should.equal('Deji');
                done()
            })
            .catch(err => {
                done(err)
            })

    })



})