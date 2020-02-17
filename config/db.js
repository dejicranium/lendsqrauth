'use strict';
module.exports = {
  development: {
    username: process.env.DEVUN || 'root',
    password: process.env.DEVPW || 'password',
    database: process.env.DEVDB || 'sys',
    host: process.env.DEVHOST || '127.0.0.1',
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
    username: 'lender',
    password: 'Su94LtyGwDx2aV7c',
    database: 'lendsqr_staging',
    host: 'staging.cyock39x6hx4.us-east-2.rds.amazonaws.com',
    dialect: 'mysql'
  },
  logging: true
};