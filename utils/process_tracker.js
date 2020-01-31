let moment = require('moment');

function next_process_cycle(latest_stop_id, date) {
    let now = moment();
    console.log('difference in days is ' + now.diff(date, 'days'))
    let is_today = now.diff(date, 'days') == 0;

    if (is_today) {
        console.log('last process date is today')
        return {
            offset: latest_stop_id,
            date: moment(date).format('YYYY-MM-DD') // return same date
        }


    } else {
        console.log('last process date is not today')

        return {
            offset: 0,
            date: moment().format('YYYY-MM-DD')
        }
    }

}

module.exports = {
    next_process_cycle
}