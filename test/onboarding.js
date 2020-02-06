const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');
const getOnboardingStatus = require('./../services/onboarding/get')


describe('#Onboarding', function () {

    this.timeout(500000);


    it('get onboarding status', async () => {
        let state = await getOnboardingStatus({
            profile: {
                role: 'borrower',
                id: 34
            },
            user: {
                id: 22
            }
        });
        console.log(state)
        state.should.be.a('object');

    })

})