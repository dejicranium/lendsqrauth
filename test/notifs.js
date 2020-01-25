const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');
const send_acceptance_notif = require('../services/collection/send_acceptance_notification')

describe('#Download Service', function () {

    this.timeout(500000);


    it('shouldsendacceptancenotif', async (done) => {
        const data = {
            collection_id: 2
        }
        send_acceptance_notif(data)
            .then(result => {
                result.should.be.a("string");
                console.log(result)
            })
            .catch(err => {
                console.log(err)
            })

    })
})