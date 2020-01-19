const verifyBankAccount = require('./requests');
const models = require('mlar')('models');

module.exports = {
    async verifyAccountName(userId, data) {
        let user = await models.user.findOne({
            where: {
                id: userId
            }
        });

        let userFullName = user.first_name ? user.first_name + ' ' + user.last_name : user.business_name;

        // data should contain account_number and bank_code;
        let name_as_list = userFullName.split(' ');

        let bankDetails = await requests.verifyBank(data);

        let account_name = bankDetails.account_name;

        let account_name_as_list = account_name.split(' ');

        let validnames = 0;

        for (let i = 0; i < name_as_list.length; i++) {
            for (let a = 0; a < a_name.length; a++) {
                let name_ = name_as_list[i];
                let a_name_ = account_name_as_list[i];

                if (a_name_.toLowerCase().indexOf(name_.toLowerCase()) > -1) {
                    validnames++;
                    continue;
                }
            }
        }

        if (validnames !== name_as_list.length) throw new Error(`${userFullName} doesn't match with account name: ${account_name}`);
    }
}