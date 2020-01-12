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


    let tenor_end =  moment().add(tenor, tenor_type).format('MMMM DD YYYY');

    let collection_end = moment().add(collections, frequency).format('MMMM DD YYYY');
    let can_proceed = true;
    if (moment(collection_end).isAfter(tenor_end)) {
       can_proceed = false;
    }
    return {tenor_end, collection_end, can_proceed: can_proceed};
}


function validateDateThresholds (tenor, tenor_type, collections, frequency) {
    switch (tenor_type) {
        case 'days':
            tenor_type_value = 0;
            break;
        case 'weeks':
            tenor_type_value = 1;
            break;
        case 'months':
            tenor_type_value = 2;
            break;
        case 'years':
            tenor_type_value = 3;
            break;
        default:
            tenor_type_value = 1;

    }
    switch (frequency) {
        case 'daily':
            collection_frequency = 0;
            break;
        case 'weekly':
            collection_frequency = 1;
            break;
        case 'monthly':
            collection_frequency = 2;
            break;
        default:
            collection_frequency = 1;

    }
    let tenor_order = ['days', 'weeks', 'months'];
    let coll_order = ['daily', 'weekly', 'monthly'];
    if (tenor_type_value < collection_frequency) {
        let tenor_index  = tenor_order.indexOf(tenor_type);

        let eq_or_less_than_tenor = coll_order.slice(0, tenor_index + 1);
        throw new Error(`Tenor type (${tenor_type}) must be equivalent or greater than collection frequency (${frequency}). Try out ${eq_or_less_than_tenor.join(', ')} as your collection frequency`)
    }
}
function normalizeTenor (tenor, tenor_type, collections, frequency) {

        // convert collection frequency and collections to fit into tenor type and tenor value
        let tenor_end = validateSetup(tenor, tenor_type, collections, frequency).tenor_end;
        let collection_end = validateSetup(tenor, tenor_type, collections, frequency).collection_end;
        let start = moment();
        let end = tenor_end;

        if (frequency === 'weekly') {
            let weeks = moment(end).diff(start, 'weeks');

            let weekDateFromNow = moment().add(weeks, 'week');

            let daysDifference = parseInt(moment(collection_end).diff(weekDateFromNow.format('MMMM DD YYYY'), 'days'));

            if (daysDifference > 0 ) {
                weeks += daysDifference;
            }
            return [weeks, 'weeks'];

        }
        else if (frequency === 'monthly') {


            let months = moment(end).diff(start, 'months');
            let monthsDateFromNow = moment().add(months, 'month');


            let daysDifference = parseInt(moment(collection_end).diff(monthsDateFromNow.format('MMMM DD YYYY'), 'days'));

            if (daysDifference > 0 ) {
                months += daysDifference;
                //return daysDifference;
            }
            return [months, 'months'];
        }
        else if (frequency === 'daily') {
            let days = moment(end).diff(start, 'days');
            let dayDateFromNow = moment().add(days, 'day');

            let daysDifference = parseInt(moment(collection_end).diff(dayDateFromNow.format('MMMM DD YYYY'), 'days'));

            if (daysDifference> 0 ) {
                days += daysDifference;
                //return daysDifference;
            }
            return [days, 'days'];
        }
}

function resolveStartDate(startDate) {
    let now = moment();
    if (now.isAfter(startDate)) {
        return now
    }
    return startDate;
}
module.exports = {
    productHasActiveCollection,
    validateSetup,
    normalizeTenor,
    validateDateThresholds,
    resolveStartDate,
}