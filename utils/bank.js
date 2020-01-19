const verifyBankAccount = require('./requests').verifyBank;
const models = require('mlar')('models');

module.exports = {
    async verifyAccountName(userId, data) {
        let user = await models.user.findOne({
            where: {
                id: userId
            }
        });
        if (!user || !user.id) throw new Error("User is not found")
        let userFullName = user.first_name ? user.first_name.trim() + ' ' + user.last_name.trim() : user.business_name.trim();

        // data should contain account_number and bank_code;
        let name_as_list = userFullName.split(' ');

        let bankDetails = await verifyBankAccount(data);

        let account_name = bankDetails.account_name;

        let account_name_as_list = account_name.split(' ');

        let validnames = 0;

        console.log("account name is " + account_name_as_list)
        console.log(" name is " + name_as_list)

        for (let i = 0; i < name_as_list.length; i++) {
            for (let a = 0; a < account_name_as_list.length; a++) {
                let name_ = name_as_list[i].toLowerCase().trim();
                let a_name = account_name_as_list[a].toLowerCase().trim();

                if (a_name.indexOf(name_.toLowerCase()) > -1) {
                    validnames++;
                    //console.log(a_name + " matches " + name_)
                    continue;
                }
            }
        }

        if (validnames !== name_as_list.length) throw new Error(`${userFullName} doesn't match account name: ${account_name}`);
    }
}