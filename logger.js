
const winston = require('winston');
require('winston-logstash');

winston.add(winston.transports.Logstash,
    {
      port: 500,
      host: '3.18.62.42',
      ssl_enable: true,
      max_connect_retries: -1,
    });

module.exports =winston;