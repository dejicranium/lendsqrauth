const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');
const createUser = require('./../services/auth/signup');
const get_borrowers = require('./../services/profile/get_borrowers')
const get_team_members = require('./../services/profile/get_team_members')
const get_user_profiles = require('./../services/profile/get_user_profiles');
const delete_team_member = require('./../services/profile/delete_team_member');
const updateStatus = require('./../services/profile/update_status');
const TestBun = require('../utils/testBun');
let tbud = new TestBun(models);

describe('#Profile Service', function () {

    let user_data = {

        first_name: "Deji",
        last_name: "Atoyebi",
        email: "itisdeji@mail.com",
        password: "IN-telligent98",
        password_confirmation: "IN-telligent98",
        business_name: "Deji Atoyebi Consult",
        phone: "08100455706",
        type: "business_lender",
        create_profile: true,
        remoteAddress: "323",
        reqData: {
            user: this,
        }
    };



    this.timeout(500000);

    before(function (done) {
        console.log('beforInc')
        /*tbud.generate('user', user_data, {
                findOrCreate: {
                    keys: ['email'],
                    updateOnFind: true,
                    force: false

                },
                deleteOnFind: {
                    keys: ['email'],
                },
                extraFunc: ['eex', 'exx', 'exx']
            })
            .then(data => {
                createUser(data).then(resp => {
                    resp.should.be.a('object');
                    resp.should.have.property('email');
                    resp['status'].should.be.equal('inactive');
                    tbud.storeResult('UserInfo', {
                        'werereere': 'ws'
                    })
                    done();
                }).catch(err => {
                    done(err);
                    console.log(err)
                })

            })
            .catch(err => {
                console.log(err)
            })*/
        done()
    });

    it.skip('should get profiles of user', (done) => {
        let userId = tbud.getResult('UserInfo');
        console.log(userId)
        get_user_profiles({
            user_id: userId
        }).then(resp => {
            resp.should.be.a('object');
            resp.should.have.property('user_id');
            resp['user_id'].should.b.equal(userId);
            done();
        })

    })

    it('should get team members', async () => {

        let result = await get_team_members({
            profile: {
                id: 1
            },

        });

        console.log(tbud.getResult('UserInfo'))
        console.log(result)
        result.should.be.a('object')


    })

    it('should change profile status', function (done) {
        let data = {
            profile_id: 2,
            status: "blasklisted"
        }
        updateStatus(data).then(resp => {
            console.log(resp)
        }).catch(err => {
            console.log(err)
        })
    })
    it('should get borrowers', function (done) {
        let data = {
            profile: {
                id: 1,
                role: 'admin'
            },
        }
        get_borrowers(data).then(resp => {
            console.log(resp)
        }).catch(err => {
            console.log(err)
        })
    })

})