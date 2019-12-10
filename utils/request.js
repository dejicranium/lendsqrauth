const axios = require('axios');
const q = require('q');


module.exports = (url, method, payload, headers, caller = null) => {
    const d = q.defer();
    // append the access key
    headers['LENDSQR_ACCESS_KEY'] = "7mvkUcJH4l45AJr9AWm1rcjJhLUFaspk";
    headers['lendsqr_access_key'] = "7mvkUcJH4l45AJr9AWm1rcjJhLUFaspk";


    q.fcall(() => {
        return axios({
            method: method,
            url: url,
            data: payload,
            headers: headers,
        })
    }).then(response => {
        response = response.data.data
        d.resolve(response)
    }).catch(err => {
        console.log(err)
        if (caller) {
            d.reject(new Error(`Could not ${caller}`))
        }
        d.reject(err)
    })

    return d.promise

}