const chai = require("chai");
const notifications = require("../../../utils/notifs/account_notifications");
const sinon = require("sinon");
const deactivateuser = require("../../../services/auth/deactivateuser");
const models = require('mlar')('models');
const generateRandom = require('mlar')('testutils').generateRandom;

let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const assert = chai.assert;

describe('DeactvateUser', function () {
    this.timeout(0);
    let user, notificationStub;

    before(function () {
        notificationStub = sinon.stub(notifications, 'userDeactivated');
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
            email: generateRandom('email'),
            phone: generateRandom('string', 10),
            type: 1,
            status: 'active'
        });
    });

    afterEach(async function () {
        await user.destroy({ force: true });
    });

    describe('#deactivateuser', function (params) {
        it('sets user status to deactivated and sends notifications', async function () {
            const params = { user_id: user.id, reason: 'Fraudulent account' };
            await deactivateuser(params)
            const updatedUser = await models.user.findOne({
                where: {
                    id: user.id
                }
            });
            assert.equal(updatedUser.status, 'deactivated');
            assert.equal(updatedUser.status_reason, 'Fraudulent account');
            sinon.assert.called(notificationStub)
        });

        it('throws an error if user is already deactivated', async function () {
            await user.update({ status: 'deactivated' });
            const params = { user_id: user.id, reason: 'Fraudulent account' };
            return assert.isRejected(deactivateuser(params), Error, 'User is already deactivated');
        });
    });
})