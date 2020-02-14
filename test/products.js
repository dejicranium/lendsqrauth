const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');
const checktoken = require('mlar').mreq('services', 'auth/checktoken');
const generateRandom = require('mlar')('testutils').generateRandom;
const utils = require('../utils/collections');
const getProducts = require('./../services/product/get')
const enableDisableProduct = require('./../services/product/enable_disable')

describe('#Products', function () {

    this.timeout(500000);


    it('should get products', async (done) => {

        getProducts({
                profile: {
                    role: 'admin',
                    id: 1
                },
                user: {
                    id: 1
                }
            })
            .then(resp => {
                resp.should.be.a('object');
                console.log(resp)
            })
            .catch(err => {
                console.log(err);
            })
    })

    it('should get products by status', async (done) => {
        getProducts({
                status: 'draft',
                profile: {
                    role: 'admin',
                    id: 1
                },
                user: {
                    id: 1
                }
            })
            .then(resp => {
                resp.should.be.a('object');
                console.log(resp)
            })
            .catch(err => {
                console.log(err);
            })
    })

    it('should get products by search', async (done) => {
        getProducts({
                search: 'agro',
                profile: {
                    role: 'admin',
                    id: 1
                },
                user: {
                    id: 1
                }
            })
            .then(resp => {
                resp.should.be.a('object');
                console.log(resp)
            })
            .catch(err => {
                console.log(err);
            })
    })
    it('should deactivate product', (done) => {
        enableDisableProduct({
            product_id: 12,
            user: {
                id: 1
            },
            status: 'deactivated',
            profile: {
                id: 2,
                role: 'admin'
            }
        }).then(result => {


            let product = models.product.findOne({
                where: {
                    id: 12
                }
            })
            product['status'].should.be.equal('deactivated');
            done()
        }).catch(error => {
            done(error);
        })
    })
})