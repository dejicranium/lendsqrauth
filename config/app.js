module.exports = {
  port: process.env.PORT || 8000,
  name: process.env.APPNAME || 'SCAFFOLD API',
  salt: process.env.PWSALT || '@#$%!!&^*---0981928',
  tokenExpiration: '10 days',
  JWTSECRET: process.env.JWTSECRET || '$*%&*$-KLIMIKELD-(*#(($*#'
};
