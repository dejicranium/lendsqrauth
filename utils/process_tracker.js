let moment = require('moment');

function next_process_cycle(latest_stop_id, date) {
    let now = moment();
    let is_today = now.diff(date, 'days') == 0;

    if (is_today) {
        return {
            offset: latest_stop_id + 1,
            date // return same date
        }


    } else {
        return {
            offset: 0,
            date: moment(date).add(1, 'days')
        }
    }

}