const scrubber = require('mlar')('obscrub');
const SCRUBVALS = require('./utils/scrubvals.json');
//const logger = require('pino')();
const reqIp = require('request-ip');

const scrubs = SCRUBVALS;

const logger = null;
try {
  logger = require('winston-logstash-transport').createLogger(null, {
    application: 'lendsqr',
    format: winston.format.json(),
    logstash: {
      host: '3.18.62.42',
      port: 5000
    },
    transports: [
      new winston.transports.Console(),
    ]
  })
} catch (e) {
  // fail silently;
}

module.exports = logger;