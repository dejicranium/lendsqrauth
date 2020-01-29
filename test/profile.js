const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const models = require('mlar')('models');

const chai = require('chai');
const get_team_members = require('./../services/profile/get_team_members')
const delete_team_member = require('./../services/profile/delete_team_member')

describe('#Profile', function () {

    this.timeout(500000);


    it('should get team members', async () => {
        let result = await get_team_members({
            profile: {
                id: 1
            },

        })
        console.log(result)
        result.should.be.a('object')

        //console.log(state)

    })
    it('delete team member', async () => {
        let result = await delete_team_member({
            profile: {
                id: 1
            },
            profile_id: 11

        })
        console.log(result)
        result.should.be.a('object')

        //console.log(state)

    })
})