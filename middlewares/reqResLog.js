const uaParser = require('ua-parser-js');

const LoggerService = require('../services/LoggerService.js');
const logger = LoggerService.getLogger('reqResLogCategory');

function reqResLog(req, res, next) {
  const startTime = new Date().getTime();
  const oldWrite = res.write;
  const oldEnd = res.end;
  const chunks = [];

  res.write = (...restArgs) => {
    chunks.push(Buffer.from(restArgs[0]));
    oldWrite.apply(res, restArgs);
  };

  res.end = (...restArgs) => {
    if (restArgs[0]) {
      chunks.push(Buffer.from(restArgs[0]));
    }
    const responseData = Buffer.concat(chunks).toString('utf8');
    const endTime = new Date().getTime();
    logMessage(req, res, responseData, startTime, endTime);

    oldEnd.apply(res, restArgs);
  };

  next();
}

function logMessage(req, res, responseData, startTime, endTime) {
  if (/^[\[\{]/.test(responseData) && /[\]\}]$/.test(responseData)) {
    responseData = JSON.parse(responseData);
  }
  const log = {
    time: new Date().toISOString(),
    fromIP: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    method: req.method,
    originalUri: req.originalUrl,
    uri: req.url,
    user: req.user,
    requestData: req.body,
    statusCode: res.statusCode,
    responseData: responseData,
    referer: req.headers.referer || '',
    userAgent: uaParser(req.headers['user-agent']),
    startTime: startTime,
    endTime: endTime,
  };

  const logToAmqp = {
    type: 'json',
    data: log,
  };

  logger.info(JSON.stringify(logToAmqp));
}

module.exports = reqResLog;
