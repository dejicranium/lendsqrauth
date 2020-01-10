const moment = require('moment');
function productHasActiveCollection(product) {
    if (product.collections.length) {
        let collections = product.collections;
        for (let i = 0; i < collections.length; i++) {
            if (collections[i].status.toLowerCase() === 'active') {
                return true
            }
        }
        return false;
    }
}
function validateSetup (tenor, tenor_type, collections, frequency) {
    switch (tenor_type) {
        case 'months':
            tenor_type = 'M';
            break;

        case 'days':
            tenor_type = 'd';
            break;

        case 'weeks':
            tenor_type = 'w';
            break;

        case 'years':
            tenor_type = 'Y';
            break;

        default:
            tenor_type = 'M';
            break;
    }

    switch (frequency) {
        case 'daily':
            frequency = 'd';
            break;

        case 'monthly':
            frequency = 'M';
            break;

        case 'weekly':
            frequency = 'w';
            break;

        default:
            frequency = 'M';
            break;
    }


    let tenor_end =  moment().add(tenor, tenor_type).format('DD MMMM YYYY');

    let collection_end = moment().add(collections, frequency).format('DD MMMM YYYY');
    let can_proceed = true;
    if (moment(collection_end).isAfter(tenor_end)) {
       can_proceed = false;
    }
    return {tenor_end, collection_end, can_proceed: can_proceed};




}

module.exports = {
    productHasActiveCollection,
    validateSetup
}