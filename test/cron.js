const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');
const chai = require('chai');
const cronService = require('../jobs/send_reminder_invitations')

describe('#Cron Service', function () {

    this.timeout(500000);


    it('should update offset', async () => {

        let response = await cronService.updateOffset({
            id: 0,
            createdAt: '2019-12-12'
        })

        response.should.be.a('object')
    })

    it('should get reminders due', async () => {

        let response = await cronService.getRemindersDue({})

        console.log(response);
        response.should.be.a('array');

        // update next reminder date;
        ///await cronService.updateNextReminderDate(response);
    })

})