'use strict';
module.exports = {
  development: {
    username: process.env.DEVUN || 'lender',
    password: process.env.DEVPW || 'Su94LtyGwDx2aV7c',
    database: process.env.DEVDB || 'lendsqr_auth',
    host: process.env.DEVHOST || 'staging.cyock39x6hx4.us-east-2.rds.amazonaws.com',
    dialect: 'mysql'
  },
  production: {
    username: process.env.PRODUN,
    password: process.env.PRODPW,
    database: process.env.PRODDB,
    host: process.env.PRODHOST,
    dialect: 'mysql'
  },
  staging: {
    username: process.env.DEVUN || 'lender',
    password: process.env.DEVPW || 'Su94LtyGwDx2aV7c',
    database: process.env.DEVDB || 'lendsqr_auth',
    host: process.env.DEVHOST || 'staging.cyock39x6hx4.us-east-2.rds.amazonaws.com',
    dialect: 'mysql'
  },
  logging: true
};
