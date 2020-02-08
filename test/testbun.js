const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');

const TestBun = require('../utils/testBun');



describe('#TestBun', function () {

    this.timeout(500000000);

    let bun = new TestBun(models);

    after(function (done) {
        bun.end();
        done()
    })

    it('should generate test bun data', (done) => {
        let data = {
            inviter_id: 10,
            token: 'cheer'
        };
        let bunOptions = {
            findOrCreate: {
                keys: ['inviter_id'],
                updateOnFind: true,
                deleteOnFind: ['inviter_id']
            },

        };


        bunOptions.findOrCreate.keys = ['inviter_id'];
        bunOptions.findOrCreate.updateOnFind = true;
        bunOptions.restoreState = ['token'];

        bun.generate('borrower_invites', data, bunOptions).then(result => {
            result.should.be.a('object')
            done()

        }).catch(error => {
            done(error)
        })


    })


})