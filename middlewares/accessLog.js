const LoggerService = require('../services/LoggerService.js');
const logger = LoggerService.getLogger('accessLogCategory');

function accessLog(req, res, next) {
  const startTime = new Date().getTime();
  const oldEnd = res.end;

  res.end = (...restArgs) => {
    const endTime = new Date().getTime();
    const method = req.method;
    const url = req.originalUrl;
    const processTime = `${endTime - startTime}ms`;
    const statusCode = res.statusCode;

    if (statusCode >= 500) {
      logger.error(method, url, statusCode, processTime);
    } else if (statusCode >= 400) {
      logger.warn(method, url, statusCode, processTime);
    } else {
      logger.info(method, url, statusCode, processTime);
    }
    oldEnd.apply(res, restArgs);
  };

  next();
}

module.exports = accessLog;
