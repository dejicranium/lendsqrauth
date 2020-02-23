const chai = require("chai");
const notifications = require("../../../utils/notifs/account_notifications");
const sinon = require("sinon");
const blacklistuser = require("../../../services/auth/blacklistuser");
const models = require('mlar')('models');
const generateRandom = require('mlar')('testutils').generateRandom;

let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const assert = chai.assert;

describe('BlacklistUser', function () {
    this.timeout(0);
    let user, notificationStub, role, profile, collection, collectionSchedule;
    let successfulCollectionSchedule;

    before(function () {
        notificationStub = sinon.stub(notifications, 'userBlacklisted');
        notificationStub.resolves(null);
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
            email: 'emeka.okoroafor@gmail.com',
            phone: generateRandom('string', 10),
            type: 1,
            status: 'active'
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
        collection = await models.collection.create({
            lender_id: profile.id,
            status: 'pending'
        });

        [collectionSchedule, successfulCollectionSchedule] = await Promise.all([
            models.collection_schedules.create({
                lender_id: profile.id,
                collection_id: collection.id,
                status: 'pending'
            }),
            models.collection_schedules.create({
                lender_id: profile.id,
                collection_id: collection.id,
                status: 'successful'
            })
        ])
    });

    afterEach(async function () {
        Promise.all([
            collectionSchedule.destroy({ force: true }),
            successfulCollectionSchedule.destroy({ force: true }),
            collection.destroy({ force: true }),
            profile.destroy({ force: true }),
            role.destroy({ force: true }),
            user.destroy({ force: true })
        ])
        await user.destroy({ force: true });
    });

    describe('#blacklistuser', function (params) {
        it('sets user status, pending collection and collection_schedules to blacklisted and sends notifications',
            async function () {
                const params = { user_id: user.id, reason: 'Fraudulent account', reqData: {} };
                await blacklistuser(params)
                await Promise.all([
                    user.reload(),
                    collection.reload(),
                    collectionSchedule.reload(),
                    successfulCollectionSchedule.reload()
                ])
                assert.equal(user.status, 'blacklisted');
                assert.equal(user.status_reason, 'Fraudulent account');
                assert.equal(collection.status, 'blacklisted');
                assert.equal(collectionSchedule.status, 'blacklisted');
                assert.equal(successfulCollectionSchedule.status, 'successful');
                sinon.assert.called(notificationStub)
            });

        it('throws an error if user is already blacklisted', async function () {
            await user.update({ status: 'blacklisted' });
            const params = { user_id: user.id, reason: 'Fraudulent account', reqData: {} };
            return assert.isRejected(blacklistuser(params), Error, 'User is already blacklisted');
        });
    });
})