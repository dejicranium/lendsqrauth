const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');
const checktoken = require('mlar').mreq('services', 'auth/checktoken');
const generateRandom = require('mlar')('testutils').generateRandom;
const utils = require('../utils/collections');
const getCollections = require('./../services/collection/get')


describe('#Collections', function () {

    this.timeout(500000);


    it('verifybvn_uniqueness', async (done) => {

        utils.validateBorrowerBvnUniqueness('itisdeji@gmal.com', '22294409275').then((result) => {
                //console.log(result);
                result.should.be.equal('proceed');
                done();
            })
            .catch(err => {
                //console.log(err)
                done(err);
            })

    })
    it('should get collections', async () => {

        getCollections({
                profile: {
                    role: 'admin',
                    status: 'inactive',
                    id: 1
                },
                //status: 'draft'
                search: 'Matem'

            }).then((result) => {
                console.log(result);
                result.should.be.a('object');
            })
            .catch(err => {
                console.log(err)

            })

    })
})