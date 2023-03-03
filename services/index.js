const config = require('../config');
const EmailService = require('./EmailService');
const TokenService = require('./TokenService');
const PasswordService = require('./PasswordService');
const FTPService = require('./FTPService');

const services = {
  email: new EmailService(),
  token: new TokenService(),
  password: new PasswordService(),
  ftp: new FTPService(config.ftp.rootFolder, config.ftp)
};

module.exports = services;
