const pino = require('pino');
const config = require('../config');
const logger = pino({ level: config.env.logLevel }, process.stdout);

module.exports = logger;
