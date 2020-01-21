const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');
const init_state = require('../utils/init_state');


describe('#INitState', function () {

    this.timeout(500000);


    it('compileInitState', async () => {
        let state = init_state.compileInitState({
            'name': "Deji",
            'created_on': "ne"
        });
        state.should.be.a('string');
        console.log(state)

    })

    it('storeState', async () => {

        init_state.storeState({
                product_name: "Deji"
            }, 'collections', 1).then((result) => {
                console.log(result);
                result.should.be.a('object');
            })
            .catch(err => {
                console.log(err);
            })

    })
    it('getInitState', async () => {

        init_state.getInitState('collections', 12).then((result) => {
                console.log(result);
                result.should.be.a('object');
            })
            .catch(err => {
                console.log(err);
            })

    })
})