const { createLogger, transports, format } = require('winston');

class Logger {
  static logger = createLogger({
    level: 'info',
    format: format.combine(format.timestamp(), format.json()),
    transports: [
      new transports.Console(),
      new transports.File({ filename: 'logs/error.log', level: 'error' }),
      new transports.File({ filename: 'logs/combined.log' }),
    ],
  });

  static logRequest(req, res, next) {
    Logger.logger.info(`${req.method} ${req.url}`);
    next();
  }
}

module.exports = Logger;