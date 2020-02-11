const scrubber = require('mlar')('obscrub');
const SCRUBVALS = require('./utils/scrubvals.json');
const logger = require('pino')();
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

module.exports = logger;
