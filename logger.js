const winston = require('winston');
require('winston-logstash');
const scrubber = require('mlar')('obscrub');
const SCRUBVALS = require('./utils/scrubvals.json');
//const logger = require('pino')();
const reqIp = require('request-ip');

const scrubs = SCRUBVALS;

function error(req, status, error, data = {}) {
  let errorData = {
    userId: req.user ? req.user.id || req.user.user_id : null,
    method: req.method,
    body: scrubber(req.body, scrubs),
    query: scrubber(req.query, scrubs),
    //headers: scrubber(req.headers, scrubs),
    useragent: req.headers['user-agent'],
    ip: reqIp.getClientIp(req),
    path: req.path,
    error: true,
    msg: error,
    service_name: 'lendsqr_auth_coll_prod',
    status: status
  };

  return logger.error(errorData);
}

const logger = require('winston-logstash-transport').createLogger(null, {
  application: 'lendsqr',
  logstash: {
    host: '3.18.62.42',
    port: 5000
  },
  transports: [
    new winston.transports.Console(),
  ]
})

module.exports = logger
/*
winston.add(winston.transports.Logstash, {
	port: 5000,
	host: '3.18.62.42',
	ssl_enable: false,
	max_connect_retries: 9
});

module.exports = winston;
*/