let config = require('../config')



module.exports = {
    requestHeaders: {
        'Content-Type': 'application/json'
    },
    mifos_headers: {
        'Content-Type': 'application/json',
        'Fineract-Platform-TenantId': 'default',
        'Authorization': 'Basic ' + Buffer.from(config.mifos_user + ':' + config.mifos_password).toString('base64')

    }
}