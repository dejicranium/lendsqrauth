const bunyan = require('bunyan');

module.exports = bunyan.createLogger({
  name: 'lendsqr_log',
  streams: [
    //  {
    //    level: 'info',
    //    stream: process.stdout
    //  }
    //   {
    //       level: 'info',
    //       path: '/Users/dejiatoyebi/Documents/omega/lendiauth/logs.json'  // log ERROR and above to a file
    //   }
  ]
});
