"use strict";
module.exports = {
    "development": {
      "username": process.env.DEVUN,
      "password": process.env.DEVPW,
      "database": process.env.DEVDB,
      "host": process.env.DEVHOST,
      "dialect": "mysql"
    },
    "production": {
      "username": process.env.PRODUN,
      "password": process.env.PRODPW,
      "database": process.env.PRODDB,
      "host": process.env.PRODHOST,
      "dialect": "mysql"
    },
    "logging":true

}
