const winston = require('winston');

let logger = null;
try {
  logger = require('winston-logstash-transport').createLogger(null, {
    application: 'lendsqr',
    format: winston.format.json(),
    logstash: {
      host: '3.18.62.42',
      port: 5000
    }
  })
} catch (e) {
  console.log(e);
  // fail silently;
}

module.exports = logger;