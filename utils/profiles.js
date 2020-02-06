const models = require('mlar')('models');
const q = require('q');


function getProfilesRoles(profiles) {
    const d = q.defer();
    let profileObjects = {};

    q.fcall(async () => {

        profiles.forEach(profile => {
            //profileObjects[ne]
        })

    })
}

async function getProfileById(id) {
    return await models.profile.findOne({
        where: {
            id: id
        },
        include: [{
            model: models.user,

        }]
    })
}

module.exports = {
    getProfileById
}