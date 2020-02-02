const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');
const inviteUser = require('../services/auth/inviteuser')
const completeRegistration = require('../services/auth/completeregistration')

const checktoken = require('mlar').mreq('services', 'auth/checktoken');
const resendinvitation = require('mlar').mreq('services', 'auth/resendtoken.auth_required');

const generateRandom = require('mlar')('testutils').generateRandom;



describe('#Complete registration', function () {

    this.timeout(500000);
    const invitation = {
        user: {
            id: 1
        },
        profile: {
            role: 'business_lender'
        },
        email: 'matemkonama@gmail.com',
        role_id: 4
    }

    it('should complete registration', async (done) => {

        let invitationOp = await inviteUser(invitation);
        let token = await models.user_invites.findOne({
            where: {
                email: invitation.email,
            }
        });

        let regData = {
            token: token,
            first_name: "Mateem",
            last_name: "Konamaa",
            password: "intelligent98",
            password_confirmation: "intelligent98",
            phone: "0810045706"
        }
        completeRegistration(regData).then((result) => {
                console.log(result);
                result.should.be.a('object');
                done();
            })
            .catch(err => {
                done(err);
            })

    })


    it('should resend invitation', async (done) => {
        const iv = {
            type: 'token',
            subtype: 'resend_invitation',
            email: 'deji.atoyebi@flutterwavego.com',
            user: {
                first_name: 'Deji',
                last_name: "Atoyebi",
            },
            profile: {
                id: 1
            }
        }
        resendinvitation(iv).then((result) => {
                console.log(result);
                result.should.be.a('object');
                done();
            })
            .catch(err => {
                done(err);
            })

    })
})