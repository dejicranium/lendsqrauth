const models = require('mlar')('models');

module.exports = {
    async isRegisteredUser(userDetails) {
        // userDetails is either user.id or a model object
        let user = userDetails;
        if (typeof (userDetails) === 'number') {
            user = await models.user.findOne({
                where: {
                    id: userDetails
                }
            })
        }

        let exists = user.password !== undefined && user.password !== null;

        return {
            user,
            exists
        }
    }
}