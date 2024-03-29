/*
Attempt loading env files
*/

if (process.env.NODE_ENV === 'live') {
  require('dotenv').config({ path: 'live.env' });
} else if (process.env.NODE_ENV === 'staging') {
  require('dotenv').config({ path: 'staging.env' });
} else {
  require('dotenv').config({ path: 'devs.env' });
}

//========================
require('./winston-workaround');
const config = require('./config');
const apm = require('elastic-apm-node').start({
  serviceName: 'auth-service',
  secretToken: config.apm_server_token,
  serverUrl: config.apm_server_url,
  ignoreUrls: ['/api/v1']
});

const models = require('./models/sequelize');
const express = require('express');
const appConfig = require('./config/app');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const apis_auth = require('./routes/auth');
const apis_profile = require('./routes/profile');
const apis_product = require('./routes/product');
const apis_collection = require('./routes/collection');
const apis_preferences = require('./routes/preference');
const apis_dashboard = require('./routes/dashboard');
const apis_audit = require('./routes/audit');
const apis_onboarding = require('./routes/onboarding');

// const runn = require('./runn');
const utils = require('mlar')('mt1l');

const EndpointRouter = require('express').Router();
//var routes = require('./routes');
/*var routes = require('./routes');
var view_routes = require('./view_routes');*/

//************//
//app.set('views', __dirname + '/views');
//app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
//************//

if (process.env.MONGODB_URI) {
  const mg = require('mongoose');
  mg.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  });
  const db = mg.connection;
}
const reqIp = require('request-ip');
const logger = require('mlar')('mongolog');
const elasticLog = require('mlar')('locallogger');
const scrubber = require('mlar')('obscrub');
const SCRUBVALS = require('./utils/scrubvals.json');
const sendCollectionRemindersCron = require('./jobs/send_reminder_invitations');

// start sendCollection reminders cron
//sendCollectionRemindersCron();

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, Access-Control-Max-Age, X-Requested-With, Content-Type, Accept, Authorization, requestId, token, api_secret, lendi_auth_token, profile_token, access_token'
  );
  res.header('Access-Control-Request-Headers', 'content-type, Content-Type');
  res.header('Access-Control-Request-Headers', 'PUT, POST, GET, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, Access-Control-Max-Age, X-Requested-With, Content-Type, Accept, Authorization, requestId, token, api_secret, lendi_auth_token, profile_token, access_token'
  );
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  //let log_dat = {...req.body, ...req.query, ...req.headers};
  const reqid =
    req.body.requestId ||
    req.query.requestId ||
    req.headers.requestid ||
    'NOREQID' + Math.ceil(Date.now() + Math.random() * 98984328);
  res._$appreqid = reqid; //Need this so response can have the value for logging as well
  const scrubs = SCRUBVALS;

  const reqlog = {
    id: reqid,
    protocol: req.protocol,
    host: req.get('host'),
    endpoint: req.baseUrl + req.path,
    ip: reqIp.getClientIp(req),
    method: req.method,
    body: scrubber(req.body, scrubs),
    query: scrubber(req.query, scrubs),
    headers: scrubber(req.headers, scrubs),
    useragent: req.headers['user-agent'],
    environment: process.env.NODE_ENV
  };

  res._request = reqlog;

  //elasticLog.info(JSON.Sreqlog);

  /*
    logger({
      type: 'request',
      id: reqid,
      comment: 'Request',
      data: reqlog
    });
    /*
      logly.info(JSON.stringify({
        type: 'request',
        id: reqid,
        comment: 'Request',
        data: reqlog,
        message: 'lame',
        status: 200,
        service: "Messaging",
        method: 'get'
      }));*/

  next();
});

const base = '/api/v1';

app.get(base, function(req, res, next) {
  res.json({
    base: 1.0,
    env: process.env.NODE_ENV
  });
});

app.use(`${base}`, apis_auth(EndpointRouter));
app.use(`${base}`, apis_profile(EndpointRouter));
app.use(`${base}`, apis_product(EndpointRouter));
app.use(`${base}`, apis_collection(EndpointRouter));
app.use(`${base}`, apis_preferences(EndpointRouter));
app.use(`${base}`, apis_dashboard(EndpointRouter));
app.use(`${base}`, apis_audit(EndpointRouter));
app.use(`${base}`, apis_onboarding(EndpointRouter));

//app.use(view_routes); //front end
/*
Handle 404
*/
//app.use(mosh.initMoshErrorHandler);

app.use(base, function(req, res, next) {
  utils.jsonF(res, null, `Undefined ${req.method} route access`);

  // res.json({m: `Undefined ${req.method} route access`})
});

// start cron job

console.log('Config file is ' + process.env.base_url);

//get_collection_schedules();

const force_sync = process.env.FORCESYNC ? true : false;

const stage = process.env.NODE_ENV || 'development-local';

console.log('environment is ' + process.env.NODE_ENV);
if (
  stage === 'development' ||
  stage === 'test' ||
  stage === 'local' ||
  stage === 'live' ||
  stage === 'staging' ||
  stage === 'development-local'
) {
  models.sequelize
    .sync({
      force: force_sync
    })
    .then(function() {
      app.listen(appConfig.port, function() {
        //runWorker();
        console.log(appConfig.name, 'is running on port', appConfig.port);
      });
    });
}
