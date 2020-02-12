const axios = require('axios');
const q = require('q');
const elasticLog = require('mlar')('locallogger');



module.exports = (url, method, payload, headers, caller = null, defaultheaders = true, attachservicekey = false) => {
    const d = q.defer();
    // append the access key if we are calling the lendsqr utility servicer
    if (defaultheaders) {
        headers['accesskey'] = "7mvkUcJH4l45AJr9AWm1rcjJhLUFaspk";
    }
    if (attachservicekey) {
        headers['service_access_key'] = '34$4l43*(z.er1*(7)&^'
    }
    elasticLog.info({
        type: `api-call`,
        message: `calling: ${url}`,
        data: payload,
        url: url,
        method: method
    })

    q.fcall(() => {
        return axios({
            method: method,
            url: url,
            data: payload,
            headers: headers,
        })
    }).then(response => {
        if (defaultheaders) {
            response = response.data.data
        } else {
            response = response.data
        }

        //console.log(response);
        d.resolve(response);
    }).catch(err => {
        //(err.response.data.errors)
        if (caller) {
            d.reject(new Error(`Could not ${caller}`))
            //throw new Error(`Could not ${caller}. Reason: ` + err );

        }
        elasticLog.info({
            type: `API call`,
            request: null,
            response: null,
            environment: process.env.NODE_ENV,
            message: `Error from calling: ${url}. Reason: ${err}`,
            data: payload
        })

        d.reject(err)
    })

    return d.promise

}