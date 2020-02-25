const elasticLog = require('mlar')('locallogger');


module.exports = () => {
    for (let i = 0; i < 60000; i++) {
        elasticLog.info("hello world " + i)
    }
}