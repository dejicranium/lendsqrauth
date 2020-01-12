const moment = require('moment');

module.exports = {
    validateSetup (tenor, tenor_type, collections, frequency) {
        switch (tenor_type) {
            case 'months':
                tenor_type = 'M';
                break;

            case 'days':
                tenor_type = 'D';
                break;

            case 'weeks':
                tenor_type = 'W';
                break;

            case 'years':
                tenor_type = 'Y';
                break;

            default:
                tenor_type = month;
                break;
        }

        switch (frequency) {
            case 'daily':
                frequency = 'D';
                break;

            case 'monthly':
                frequency = 'M';
                break;

            case 'weekly':
                frequency = 'W';
                break;

            default:
                frequency = 'M';
                break;
        }


        let tenor_end =  moment().add(tenor, tenor_type);

        let collection_end = moment().add(collections, frequency);

        if (collection_end.isAfter(tenor_end)) {
            throw new Error("No. of collections and collection frequency should fit in tenor range")
        }
        else {
            return "PROCEED"
        }


    }

}