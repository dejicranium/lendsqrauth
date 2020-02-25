const chai = require("chai");
const notifications = require("../../../utils/notifs/account_notifications");
const sinon = require("sinon");
const updateStatus = require("../../../services/profile/update_status");
const models = require('mlar')('models');
const generateRandom = require('mlar')('testutils').generateRandom;

let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const assert = chai.assert;

describe('UpdateStatus', function () {
    this.timeout(0);
    let user, role, profile, deactivatedNotif, reactivatedNotif;

    before(function () {
        deactivatedNotif = sinon.stub(notifications, 'profileDeactivated');
        reactivatedNotif = sinon.stub(notifications, 'profileReactivated');
    });

    after(function () {
        sinon.restore();
    });

    beforeEach(async function () {
        const password = 'password';
        user = await models.user.create({
            first_name: generateRandom('string', 10),
            last_name: generateRandom('string', 5),
            password: password,
            password_confirmation: password,
            email: generateRandom('email'),
            phone: generateRandom('string', 10),
            type: 1,
            status: 'active',
            created_on: new Date()
        });
        role = await models.role.create({
            name: generateRandom('string', 5),
            created_on: new Date()
        });
        profile = await models.profile.create({
            role_id: role.id,
            user_id: user.id,
            status: 'active',
            created_on: new Date(),
            uuid: Math.random().toString(36).substr(2, 9)
        });
    });

    afterEach(async function () {
        await Promise.all([
            profile.destroy({ force: true }),
            role.destroy({ force: true }),
            user.destroy({ force: true })
        ])
    });

    describe('#update status', function (params) {
        it('sets profile status to deactivated and sends notifications', async function () {
            const params = { profile_id: profile.id, status: 'deactivated', reason: 'Fraudulent account' };
            await updateStatus(params)
            const updatedProfile = await models.profile.findOne({
                where: {
                    id: profile.id
                }
            });
            assert.equal(updatedProfile.status, 'deactivated');
            assert.equal(updatedProfile.status_reason, 'Fraudulent account');
            sinon.assert.called(deactivatedNotif)
        });

        it('sets profile status to active if it was previously deactivated and sends notifications', async function () {
            const params = { profile_id: profile.id, status: 'active', reason: 'Cleared' };
            await profile.update({ status: 'deactivated' });
            await updateStatus(params)
            const updatedProfile = await models.profile.findOne({
                where: {
                    id: profile.id
                }
            });
            assert.equal(updatedProfile.status, 'active');
            sinon.assert.called(reactivatedNotif);
        });
    });
})