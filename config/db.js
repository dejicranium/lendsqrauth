'use strict';
module.exports = {
  development: {
    username: process.env.DEVUN || 'lender',
    password: process.env.DEVPW || 'Su94LtyGwDx2aV7c',
    database: process.env.DEVDB || 'lendsqr_auth',
    host: process.env.DEVHOST || 'staging.cyock39x6hx4.us-east-2.rds.amazonaws.com',
    dialect: 'mysql'
  },
  live: {
    username: 'lender',
    password: '8IG5EvP2EZxow3nY',
    database: 'lendsqr_live',
    host: 'live-2.cyock39x6hx4.us-east-2.rds.amazonaws.com',
    dialect: 'mysql'
  },
  staging: {
    username: 'lender',
    password: 'Su94LtyGwDx2aV7c',
    database: 'lendsqr_staging',
    host: 'staging.cyock39x6hx4.us-east-2.rds.amazonaws.com',
    dialect: 'mysql'
  },
  logging: true
};
