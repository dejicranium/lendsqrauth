var router = require('express').Router();
var handlers = require('/routes')
var middlewares = require('./middlewares');
var utils    = require('mt1l');

//console.log(middlewares);
utils.buildRoutes(handlers, middlewares, router);

module.exports = router;