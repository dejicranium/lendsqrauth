
/*
Attempt loading env files
*/
try{
  const appEnvProfile = process.env.ENV_PROFILE || "";
  let envPath = "";
  if(appEnvProfile) {
    envPath = `.${appEnvProfile}`
  }
  const fullEnvPath = './config/env'+ envPath +'.json';
  console.log(fullEnvPath);
	var envJSON = require(fullEnvPath);
	for(var envProp in envJSON){
		process.env[envProp] = envJSON[envProp];
	}
	//console.log(envJSON);
}
catch (e){
	//console.log(e);
}
//========================
var models     = require('./models/sequelize');
var express    = require('express');
var appConfig  = require('./config/app');
var bodyParser = require('body-parser');
var path = require('path');

var app    = express();
const apis_auth = require('./routes/auth');
const apis_profile = require('./routes/profile');
const apis_product = require('./routes/product');
const apis_collection = require('./routes/collection');

const EndpointRouter = require('express').Router();

//var routes = require('./routes');
/*var routes = require('./routes');
var view_routes = require('./view_routes');*/

//************//
//app.set('views', __dirname + '/views');
//app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
//************//
 
if(process.env.MONGODB_URI){
  const mg = require('mongoose');
  mg.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false });
  const db = mg.connection;
}
const reqIp = require('request-ip');
const logger = require('mlar')('mongolog');
const scrubber = require('mlar')('obscrub');
const SCRUBVALS = require('./utils/scrubvals.json');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());



app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, requestId, token, api_secret, lendi_auth_token");
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  //let log_dat = {...req.body, ...req.query, ...req.headers};
  const reqid = req.body.requestId || req.query.requestId || req.headers.requestid || 'NOREQID' + Math.ceil(Date.now() + (Math.random() * 98984328));
  res._$appreqid = reqid; //Need this so response can have the value for logging as well
  const scrubs = SCRUBVALS;
  const reqlog = {
    protocol: req.protocol,
    host: req.get('host'),
    endpoint: req.baseUrl + req.path,
    ip: reqIp.getClientIp(req),
    method: req.method,
    body: scrubber(req.body, scrubs),
    query: scrubber(req.query, scrubs),
    headers: scrubber(req.headers, scrubs),
    useragent: req.headers['user-agent']
  } 
  logger({
    type: 'request',
    id: reqid,
    comment: 'Request',
    data: reqlog
  });


  next();
});

const base = 'api/v1/';

app.get(base, function (req, res, next){

  res.json({version:1.0})

})

// const version = '/v1';
app.use(`${base}auth`, apis_auth(EndpointRouter));
app.use(`${base}profile`, apis_profile(EndpointRouter));
app.use(`${base}product`, apis_product(EndpointRouter));
app.use(`${base}collection`, apis_collection(EndpointRouter));



//app.use(view_routes); //front end
/*
Handle 404
*/
//app.use(mosh.initMoshErrorHandler);


app.use(base, function(req, res, next) {
  res.json({m: `Undefined ${req.method} route access`})
})


var force_sync = process.env.FORCESYNC ? true : false;

var stage = process.env.NODE_ENV || "development-local";
if (stage === "development" || stage === "test" || stage === "local" || stage === "production" || stage === "development-local") {
  models.sequelize.sync({force: force_sync}).then(function () {
    app.listen(appConfig.port, function () {
      //runWorker();
      console.log([appConfig.name, 'is running on port', appConfig.port.toString()].join(" "));
    });
  });
}

