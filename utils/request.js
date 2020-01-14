const axios = require('axios');
const q = require('q');



module.exports = (url, method, payload, headers, caller = null, defaultheaders = true, attachservicekey = false) => {
    const d = q.defer();
    // append the access key if we are calling the lendsqr utility servicer
    if (defaultheaders) {
        headers['accesskey'] = "7mvkUcJH4l45AJr9AWm1rcjJhLUFaspk";
    }
    if (attachservicekey) {
        headers['service_access_key'] = '34$4l43*(z.er1*(7)&^'
    }

    q.fcall(() => {
        return axios({
            method: method,
            url: url,
            data: payload,
            headers: headers,
        })
    }).then(response => {
        console.log("called " + url)
        if (defaultheaders) {
            response = response.data.data
        } else {
            response = response.data
        }
        console.log(response);
        d.resolve(response);
    }).catch(err => {
        console.log(err.response.data.errors)
        if (caller) {
            d.reject(new Error(`Could not ${caller}`))
        }
        d.reject(err)
    })

    return d.promise

}